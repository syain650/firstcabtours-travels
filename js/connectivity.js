
/**
 * FIRST CAB — Strict Network-Aware UI
 */
(function () {
  'use strict';

  let isOnline = navigator.onLine;
  let toastTimer = null;
  let toastEl = null;
  let offlineScreen = null;

  function createOfflineScreen() {
    if (offlineScreen) return;
    offlineScreen = document.createElement('div');
    offlineScreen.id = 'fc-global-offline-screen';
    offlineScreen.innerHTML = `
      <i class="fas fa-wifi-slash fc-offline-icon"></i>
      <h2 class="fc-offline-title">No Internet Connection</h2>
      <p class="fc-offline-sub">Please check your network and try again</p>
      <button class="fc-offline-retry" id="fc-offline-retry-btn" onclick="window.checkNetworkRetry(this)">
        <span>Retry Connection</span>
      </button>
    `;
    document.body.appendChild(offlineScreen);
  }

  function createToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.className = 'fc-net-toast';
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(text, type, duration = 3000) {
    clearTimeout(toastTimer);
    const toast = createToast();
    toast.className = 'fc-net-toast fc-net-toast--' + type;
    toast.innerHTML = `<i class="fas ${type === 'online' ? 'fa-wifi' : 'fa-exclamation-triangle'}"></i><span>${text}</span>`;
    
    requestAnimationFrame(() => toast.classList.add('show'));
    
    if (duration > 0) {
      toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
    }
  }

  function updateNetworkStatus() {
    isOnline = navigator.onLine;
    createOfflineScreen();

    if (isOnline) {
      document.body.classList.remove('is-offline');
      showToast("You're back online", 'online', 2500);
    } else {
      document.body.classList.add('is-offline');
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Soft Retry Logic
  window.checkNetworkRetry = function(btn) {
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Checking...`;
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    // Optional mobile vibration
    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      updateNetworkStatus();
      
      // If still offline, shake the button slightly for feedback
      if (!navigator.onLine) {
        btn.style.animation = 'fc-shake 0.4s ease';
        setTimeout(() => btn.style.animation = '', 400);
      }
    }, 800); // simulate check time
  };

  // Initial Check
  if (!isOnline) {
    document.addEventListener('DOMContentLoaded', () => {
      createOfflineScreen();
      document.body.classList.add('is-offline');
    });
  }

})();
