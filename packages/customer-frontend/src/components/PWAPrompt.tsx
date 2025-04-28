import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from 'react-bootstrap';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Define a more specific type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAPromptProps {
  onInstallPromptAvailable?: (event: BeforeInstallPromptEvent | null) => void;
  installPrompt?: BeforeInstallPromptEvent | null;
}

function PWAPrompt({ onInstallPromptAvailable, installPrompt }: PWAPromptProps) {
  // Track install state at the top level, not inside useEffect
  const [isInstalled, setIsInstalled] = useState(false);
  
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, r: any) {
      console.log(`Service Worker Registered: ${swUrl}`);
      if (r?.waiting) {
        // Send message to service worker to skip waiting if registration is successful
        r.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error:', error);
      toast.error('App offline features may not work properly.');
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Handle offline readiness
  React.useEffect(() => {
    if (offlineReady) {
      // In production, we can uncomment this to show a toast when the app is ready to work offline
      // toast.success('App is ready to work offline!', { duration: 4000 });
      setOfflineReady(false); // Close state
    }
  }, [offlineReady, setOfflineReady]);

  // Only run this effect if we don't have an installPrompt passed as a prop
  useEffect(() => {
    if (!installPrompt) {
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault(); 
        console.log('beforeinstallprompt event fired');
        
        // Pass the event to the parent component
        if (!isInstalled && onInstallPromptAvailable) {
          onInstallPromptAvailable(e as BeforeInstallPromptEvent);
        }
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        if (onInstallPromptAvailable) {
          onInstallPromptAvailable(null);
        }
        console.log('PWA was installed');
        toast.success('App installed successfully!');
      };

      // Check if app is already installed
      const checkIfInstalled = () => {
        // @ts-ignore - This property exists in some browsers but TypeScript doesn't know about it
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
          setIsInstalled(true);
          if (onInstallPromptAvailable) {
            onInstallPromptAvailable(null);
          }
        }
      };

      // Add event listeners
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Check if already installed
      checkIfInstalled();

      // Cleanup listeners on component unmount
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [installPrompt, onInstallPromptAvailable, isInstalled]);

  // Handle update notifications
  React.useEffect(() => {
    if (needRefresh) {
      // Show a persistent toast prompting the user to update
      toast(
        (t) => (
          <div className="d-flex flex-column align-items-center">
            <span className="mb-2">A new version is available! Refresh to update.</span>
            <div className="d-flex gap-2 mt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  updateServiceWorker(true); // Passing true reloads the page
                  toast.dismiss(t.id); // Dismiss this toast on click
                }}
              >
                Refresh Now
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  setNeedRefresh(false);
                }}
              >
                Later
              </Button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Keep toast visible until dismissed or button clicked
          id: 'pwa-update-toast', // Assign an ID to prevent duplicates
        }
      );
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  // This component doesn't render anything directly in the DOM
  return null;
}

export default PWAPrompt; 