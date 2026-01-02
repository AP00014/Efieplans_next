// Service Worker Registration Utility
export const registerServiceWorker = async () => {
  // Only register service worker in production
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/Efieplans/'
      });

      console.log('[SW] Service worker registered successfully:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message from service worker:', event.data);
      });

    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  } else {
    console.warn('[SW] Service workers not supported in this browser');
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[SW] Service worker unregistered');
    } catch (error) {
      console.error('[SW] Service worker unregistration failed:', error);
    }
  }
};

const showUpdateNotification = () => {
  // Create a simple update notification
  const updateDiv = document.createElement('div');
  updateDiv.id = 'sw-update-notification';
  updateDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff8c00;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <p style="margin: 0 0 0.5rem 0; font-weight: 600;">Update Available</p>
      <p style="margin: 0 0 1rem 0; font-size: 0.9rem;">A new version is available. Refresh to update.</p>
      <div style="display: flex; gap: 0.5rem;">
        <button onclick="window.location.reload()" style="
          background: white;
          color: #ff8c00;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        ">Refresh</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    </div>
  `;
  document.body.appendChild(updateDiv);
};

// Check for updates periodically
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('[SW] Checked for updates');
    } catch (error) {
      console.error('[SW] Update check failed:', error);
    }
  }
};

// Export for use in components
export default {
  register: registerServiceWorker,
  unregister: unregisterServiceWorker,
  checkForUpdates
};