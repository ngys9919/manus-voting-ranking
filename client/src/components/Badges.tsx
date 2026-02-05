import { Card } from "@/components/ui/card";
import {
  Zap,
  Flame,
  Trophy,
  Crown,
  Star,
  Sparkles,
  Heart,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: Date;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
};

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  green: "bg-green-100 text-green-700 border-green-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
  red: "bg-red-100 text-red-700 border-red-300",
};

interface BadgesProps {
  achievements: Achievement[];
  allAchievements?: Achievement[];
}

export function Badges({ achievements, allAchievements = [] }: BadgesProps) {
  const unlockedCodes = new Set(achievements.map(a => a.code));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Achievements ({achievements.length})
        </h3>

        {achievements.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-600">
              No achievements unlocked yet. Start voting to earn badges!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {achievements.map(achievement => (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg border-2 ${
                        COLOR_MAP[achievement.color] || COLOR_MAP.blue
                      }`}
                    >
                      {ICON_MAP[achievement.icon] || (
                        <Trophy className="w-6 h-6" />
                      )}
                      <p className="text-xs font-semibold mt-2 line-clamp-2">
                        {achievement.name}
                      </p>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-semibold">{achievement.name}</p>
                      <p className="text-xs text-slate-400">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-slate-400 mt-1">
                          Unlocked:{" "}
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {allAchievements.length > 0 && achievements.length < allAchievements.length && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Locked Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allAchievements
              .filter(a => !unlockedCodes.has(a.code))
              .map(achievement => (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg border-2 border-slate-300 bg-slate-50 text-slate-400">
                        <div className="relative">
                          {ICON_MAP[achievement.icon] || (
                            <Trophy className="w-6 h-6" />
                          )}
                          <Lock className="w-3 h-3 absolute -bottom-1 -right-1 bg-slate-50 rounded-full" />
                        </div>
                        <p className="text-xs font-semibold mt-2 line-clamp-2">
                          {achievement.name}
                        </p>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-xs text-slate-400">
                          {achievement.description}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
