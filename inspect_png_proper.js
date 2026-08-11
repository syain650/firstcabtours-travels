const fs = require('fs');
const zlib = require('zlib');

function paethPredictor(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
}

function parseAndDefilterPng(filename) {
    try {
        const fileBuffer = fs.readFileSync(filename);

        let offset = 8;
        const idatBuffers = [];
        let width = 0;
        let height = 0;
        let bitDepth = 0;
        let colorType = 0;

        while (offset < fileBuffer.length) {
            if (offset + 8 > fileBuffer.length) break;
            const length = fileBuffer.readUInt32BE(offset);
            const chunkType = fileBuffer.toString('ascii', offset + 4, offset + 8);

            if (chunkType === 'IHDR') {
                width = fileBuffer.readUInt32BE(offset + 8);
                height = fileBuffer.readUInt32BE(offset + 12);
                bitDepth = fileBuffer.readUInt8(offset + 16);
                colorType = fileBuffer.readUInt8(offset + 17);
            } else if (chunkType === 'IDAT') {
                idatBuffers.push(fileBuffer.slice(offset + 8, offset + 8 + length));
            } else if (chunkType === 'IEND') {
                break;
            }

            offset += 12 + length;
        }

        if (colorType !== 6 || bitDepth !== 8) {
            console.log(`${filename}: Only 8-bit RGBA (Type 6) is supported by this parser. Got colorType=${colorType}, bitDepth=${bitDepth}`);
            return;
        }

        const compressed = Buffer.concat(idatBuffers);
        const decompressed = zlib.inflateSync(compressed);

        const bytesPerPixel = 4;
        const stride = 1 + width * bytesPerPixel;
        const pixels = Buffer.alloc(width * height * bytesPerPixel);

        for (let y = 0; y < height; y++) {
            const scanlineStart = y * stride;
            const filterType = decompressed[scanlineStart];
            const prevRowStart = (y - 1) * width * bytesPerPixel;
            const currRowStart = y * width * bytesPerPixel;

            for (let x = 0; x < width; x++) {
                for (let c = 0; c < bytesPerPixel; c++) {
                    const rawByte = decompressed[scanlineStart + 1 + x * bytesPerPixel + c];
                    const pixelIndex = currRowStart + x * bytesPerPixel + c;

                    const leftVal = x > 0 ? pixels[currRowStart + (x - 1) * bytesPerPixel + c] : 0;
                    const upVal = y > 0 ? pixels[prevRowStart + x * bytesPerPixel + c] : 0;
                    const upLeftVal = (x > 0 && y > 0) ? pixels[prevRowStart + (x - 1) * bytesPerPixel + c] : 0;

                    let reconVal = 0;
                    switch (filterType) {
                        case 0: // None
                            reconVal = rawByte;
                            break;
                        case 1: // Sub
                            reconVal = (rawByte + leftVal) & 0xFF;
                            break;
                        case 2: // Up
                            reconVal = (rawByte + upVal) & 0xFF;
                            break;
                        case 3: // Average
                            reconVal = (rawByte + Math.floor((leftVal + upVal) / 2)) & 0xFF;
                            break;
                        case 4: // Paeth
                            reconVal = (rawByte + paethPredictor(leftVal, upVal, upLeftVal)) & 0xFF;
                            break;
                        default:
                            throw new Error(`Unknown PNG filter type: ${filterType}`);
                    }
                    pixels[pixelIndex] = reconVal;
                }
            }
        }

        // Now analyze the true reconstructed pixels!
        let transparent = 0;
        let opaque = 0;
        let colorCounts = {};

        for (let i = 0; i < width * height; i++) {
            const idx = i * bytesPerPixel;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const a = pixels[idx + 3];

            if (a === 0) {
                transparent++;
            } else {
                opaque++;
                const hex = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}[${a}]`;
                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }
        }

        console.log(`${filename}:`);
        console.log(`  True Opaque pixels (Alpha > 0): ${opaque}`);
        console.log(`  True Transparent pixels (Alpha == 0): ${transparent}`);
        console.log(`  Top 5 colors among non-transparent pixels:`);
        Object.keys(colorCounts)
            .sort((a, b) => colorCounts[b] - colorCounts[a])
            .slice(0, 5)
            .forEach(c => {
                console.log(`    Color #${c}: ${colorCounts[c]} pixels`);
            });

    } catch (err) {
        console.error(`Error parsing ${filename}:`, err);
    }
}

parseAndDefilterPng('firstcab-logo-new.png');
parseAndDefilterPng('primary_logo_transparent.png');
