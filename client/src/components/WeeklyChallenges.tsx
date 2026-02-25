import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface WeeklyChallenge {
  id: number;
  weekStartDate: Date;
  weekEndDate: Date;
  isActive: boolean;
  topStreakers: Array<{
    rank: number;
    userId: number;
    userName: string;
    streakLength: number;
    badgeIcon: string;
    badgeName: string;
  }>;
}

export function WeeklyChallenges() {
  const { data: challenge, isLoading } = trpc.weeklyStreakChallenges.getCurrent.useQuery();
  const [weekDisplay, setWeekDisplay] = useState<string>("");

  useEffect(() => {
    if (challenge) {
      const start = new Date(challenge.weekStartDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(challenge.weekEndDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      setWeekDisplay(`${start} - ${end}`);
    }
  }, [challenge]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Streak Challenge</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-blue-100 border-blue-300";
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return "1st Place";
      case 2:
        return "2nd Place";
      case 3:
        return "3rd Place";
      default:
        return `${rank}th Place`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span>
          Weekly Streak Challenge
        </CardTitle>
        <CardDescription>
          {challenge.isActive ? "This week's competition" : "Challenge completed"} ({weekDisplay})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenge.topStreakers && challenge.topStreakers.length > 0 ? (
            <div className="space-y-3">
              {challenge.topStreakers.map((streaker) => (
                <div
                  key={`${streaker.userId}-${streaker.rank}`}
                  className={`p-4 rounded-lg border-2 ${getRankColor(streaker.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{streaker.badgeIcon}</span>
                      <div>
                        <p className="font-semibold text-sm">{getRankLabel(streaker.rank)}</p>
                        <p className="text-sm text-gray-600">{streaker.userName || "Anonymous"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{streaker.streakLength} days</p>
                      <Badge variant="outline" className="text-xs">
                        {streaker.badgeName}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No streakers yet this week</p>
              <p className="text-sm">Start voting to compete!</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">How it works:</span> The users with the 3 longest
            voting streaks this week earn limited-time badges. Keep your streak alive to compete!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
