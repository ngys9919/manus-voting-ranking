import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AchievementProgressItem {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  currentProgress: number;
  targetValue: number;
  progressPercentage: number;
  unlockedAt?: Date;
}

export function AchievementProgress() {
  const { data: nextAchievements, isLoading } = trpc.achievements.getNext.useQuery(
    { limit: 3 }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!nextAchievements || nextAchievements.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">
          You've unlocked all achievements! 🎉
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {nextAchievements.map((achievement) => (
        <Card key={achievement.code} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {achievement.currentProgress}/{achievement.targetValue}
                  </div>
                  <div className="text-sm text-gray-500">
                    {achievement.progressPercentage}%
                  </div>
                </div>
              </div>

              <Progress
                value={achievement.progressPercentage}
                className="h-2"
              />

              <div className="mt-2 text-xs text-gray-500">
                {achievement.targetValue - achievement.currentProgress} more to unlock
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
