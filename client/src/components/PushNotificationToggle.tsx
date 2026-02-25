import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe } =
    usePushNotifications();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="flex items-center gap-2"
        title={
          isSubscribed
            ? 'Disable push notifications'
            : 'Enable push notifications'
        }
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-4 h-4 text-emerald-600" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        <span className="text-sm">
          {isLoading
            ? 'Setting up...'
            : isSubscribed
            ? 'Notifications On'
            : 'Notifications Off'}
        </span>
      </Button>

      {showError && error && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
