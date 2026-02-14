import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Map,
  Flame,
  Snowflake,
  Flower2,
  Sun,
  Leaf,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Challenge {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: "seasonal" | "monthly";
  season?: string | null;
  targetValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface UserChallengeProgress {
  id: number;
  userId: number;
  challengeId: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  challenge: Challenge;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6" />,
  Map: <Map className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Snowflake: <Snowflake className="w-6 h-6" />,
  Flower2: <Flower2 className="w-6 h-6" />,
  Sun: <Sun className="w-6 h-6" />,
  Leaf: <Leaf className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
};

const COLOR_MAP: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-300",
  orange: "bg-orange-100 text-orange-700 border-orange-300",
  green: "bg-green-100 text-green-700 border-green-300",
  purple: "bg-purple-100 text-purple-700 border-purple-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
  red: "bg-red-100 text-red-700 border-red-300",
  pink: "bg-pink-100 text-pink-700 border-pink-300",
};

interface ChallengesProps {
  activeChallenges: UserChallengeProgress[];
  completedChallenges: UserChallengeProgress[];
}

export function Challenges({
  activeChallenges,
  completedChallenges,
}: ChallengesProps) {
  const monthlyChallenges = activeChallenges.filter(
    c => c.challenge.type === "monthly"
  );
  const seasonalChallenges = activeChallenges.filter(
    c => c.challenge.type === "seasonal"
  );

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Monthly Challenges */}
      {monthlyChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyChallenges.map(userChallenge => {
              const percentage = getProgressPercentage(
                userChallenge.progress,
                userChallenge.challenge.targetValue
              );
              const isCompleted = userChallenge.isCompleted;

              return (
                <TooltipProvider key={userChallenge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-4 border-2 transition-all ${
                          isCompleted
                            ? "bg-green-50 border-green-300"
                            : COLOR_MAP[userChallenge.challenge.color] ||
                              COLOR_MAP.blue
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {ICON_MAP[userChallenge.challenge.icon] || (
                              <Trophy className="w-6 h-6" />
                            )}
                            <div>
                              <p className="font-semibold text-sm">
                                {userChallenge.challenge.name}
                              </p>
                              <p className="text-xs text-slate-600">
                                {userChallenge.challenge.description}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {userChallenge.progress} /{" "}
                              {userChallenge.challenge.targetValue}
                            </span>
                            <span className="text-slate-600">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2"
                          />
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">
                          {userChallenge.challenge.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {userChallenge.challenge.description}
                        </p>
                        {isCompleted && userChallenge.completedAt && (
                          <p className="text-xs text-green-400 mt-1">
                            Completed:{" "}
                            {new Date(
                              userChallenge.completedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* Seasonal Challenges */}
      {seasonalChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Seasonal Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalChallenges.map(userChallenge => {
              const percentage = getProgressPercentage(
                userChallenge.progress,
                userChallenge.challenge.targetValue
              );
              const isCompleted = userChallenge.isCompleted;

              return (
                <TooltipProvider key={userChallenge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-4 border-2 transition-all ${
                          isCompleted
                            ? "bg-green-50 border-green-300"
                            : COLOR_MAP[userChallenge.challenge.color] ||
                              COLOR_MAP.blue
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {ICON_MAP[userChallenge.challenge.icon] || (
                              <Trophy className="w-6 h-6" />
                            )}
                            <div>
                              <p className="font-semibold text-sm">
                                {userChallenge.challenge.name}
                              </p>
                              <p className="text-xs text-slate-600">
                                {userChallenge.challenge.description}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {formatDate(userChallenge.challenge.startDate)}{" "}
                                - {formatDate(userChallenge.challenge.endDate)}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {userChallenge.progress} /{" "}
                              {userChallenge.challenge.targetValue}
                            </span>
                            <span className="text-slate-600">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2"
                          />
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">
                          {userChallenge.challenge.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {userChallenge.challenge.description}
                        </p>
                        {isCompleted && userChallenge.completedAt && (
                          <p className="text-xs text-green-400 mt-1">
                            Completed:{" "}
                            {new Date(
                              userChallenge.completedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Completed Challenges ({completedChallenges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {completedChallenges.map(userChallenge => (
              <TooltipProvider key={userChallenge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-lg border-2 bg-green-50 border-green-300">
                      {ICON_MAP[userChallenge.challenge.icon] || (
                        <Trophy className="w-6 h-6" />
                      )}
                      <p className="text-xs font-semibold mt-2 line-clamp-2">
                        {userChallenge.challenge.name}
                      </p>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-semibold">
                        {userChallenge.challenge.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {userChallenge.challenge.description}
                      </p>
                      {userChallenge.completedAt && (
                        <p className="text-xs text-green-400 mt-1">
                          Completed:{" "}
                          {new Date(
                            userChallenge.completedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-slate-600">
            No challenges available at the moment. Check back soon!
          </p>
        </Card>
      )}
    </div>
  );
}
