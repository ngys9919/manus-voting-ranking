import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Leaderboard() {
  const [limit] = useState(10);

  const { data: topVoters, isLoading: votersLoading } = trpc.leaderboard.topVoters.useQuery({ limit });
  const { data: mostAchievements, isLoading: achievementsLoading } = trpc.leaderboard.mostAchievements.useQuery({ limit });
  const { data: longestStreaks, isLoading: streaksLoading } = trpc.leaderboard.longestStreaks.useQuery({ limit });

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const LeaderboardCard = ({ icon, name, value, subtitle }: { icon: string; name: string; value: number | string; subtitle?: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboards</h1>
          <p className="text-gray-600">See who's leading the National Park Ranker community</p>
        </div>

        <Tabs defaultValue="voters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voters">Top Voters</TabsTrigger>
            <TabsTrigger value="achievements">Most Achievements</TabsTrigger>
            <TabsTrigger value="streaks">Longest Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="voters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Voters</CardTitle>
                <CardDescription>Users with the most votes cast</CardDescription>
              </CardHeader>
              <CardContent>
                {votersLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : topVoters && topVoters.length > 0 ? (
                  <div className="space-y-3">
                    {topVoters.map((voter) => (
                      <LeaderboardCard
                        key={voter.userId}
                        icon={getMedalIcon(voter.rank)}
                        name={voter.userName || "Anonymous"}
                        value={voter.voteCount}
                        subtitle="votes"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No voters yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Achievements</CardTitle>
                <CardDescription>Users with the most unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : mostAchievements && mostAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {mostAchievements.map((user) => (
                      <LeaderboardCard
                        key={user.userId}
                        icon={getMedalIcon(user.rank)}
                        name={user.userName || "Anonymous"}
                        value={user.achievementCount}
                        subtitle="achievements"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No achievements yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Longest Streaks</CardTitle>
                <CardDescription>Users with the longest voting streaks</CardDescription>
              </CardHeader>
              <CardContent>
                {streaksLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : longestStreaks && longestStreaks.length > 0 ? (
                  <div className="space-y-3">
                    {longestStreaks.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getMedalIcon(user.rank)}</div>
                          <div>
                            <p className="font-medium text-gray-900">{user.userName || "Anonymous"}</p>
                            <p className="text-sm text-gray-500">Current: {user.currentStreak} days | Best: {user.longestStreak} days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{user.longestStreak}</div>
                          <div className="text-xs text-gray-500">days</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No streaks yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
