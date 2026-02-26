import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import {
  getNotificationSoundPreference,
  setNotificationSoundPreference,
  playNotificationSound,
  isAudioSupported,
} from "@/lib/audioAlert";
import { toast } from "sonner";

export function NotificationPreferences() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioSupported] = useState(isAudioSupported());

  // Load preference from localStorage on mount
  useEffect(() => {
    const preference = getNotificationSoundPreference();
    setSoundEnabled(preference);
    setIsLoading(false);
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setNotificationSoundPreference(enabled);

    if (enabled) {
      toast.success("Notification sound enabled");
      // Play a preview sound
      playNotificationSound(true);
    } else {
      toast.success("Notification sound disabled");
    }
  };

  const handlePlayPreview = () => {
    playNotificationSound(true);
    toast.success("Preview sound played");
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Customize how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Alert Setting */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <Label htmlFor="sound-toggle" className="text-base font-medium cursor-pointer">
                  Sound Alerts
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {audioSupported
                    ? "Play a sound when you receive new notifications"
                    : "Audio alerts are not supported in your browser"}
                </p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
              disabled={!audioSupported}
            />
          </div>

          {/* Preview Button */}
          {audioSupported && (
            <div className="pl-8">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePlayPreview}
                className="w-full sm:w-auto"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Preview Sound
              </Button>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Make sure your device volume is turned up to hear notification sounds.
          </p>
        </div>

        {/* Browser Compatibility Note */}
        {!audioSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Note:</strong> Your browser doesn't support audio alerts. Please use a modern browser
              like Chrome, Firefox, Safari, or Edge.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
