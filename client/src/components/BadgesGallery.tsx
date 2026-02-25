import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Trophy, Zap, Target } from "lucide-react";
import { SocialShareButtons } from "./SocialShareButtons";
import { generateAchievementShareText } from "@/lib/socialSharing";

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}

interface BadgesGalleryProps {
  achievements: Achievement[];
  isLoading?: boolean;
}

export function BadgesGallery({ achievements, isLoading = false }: BadgesGalleryProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filterType, setFilterType] = useState<"all" | "unlocked" | "locked">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");
  const [showShareModal, setShowShareModal] = useState(false);

  const getAchievementIcon = (code: string) => {
    const iconMap: Record<string, string> = {
      first_vote: "⚡",
      ten_votes: "🔥",
      fifty_votes: "🏆",
      hundred_votes: "👑",
      favorite_top_ten: "⭐",
      favorite_top_five: "✨",
      favorite_number_one: "💎",
      three_day_streak: "🔥",
      seven_day_streak: "⭐",
      fourteen_day_streak: "💫",
      thirty_day_streak: "👑",
    };
    return iconMap[code] || "🎉";
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
      orange: "bg-orange-100 text-orange-800 border-orange-300",
      green: "bg-green-100 text-green-800 border-green-300",
      purple: "bg-purple-100 text-purple-800 border-purple-300",
      blue: "bg-blue-100 text-blue-800 border-blue-300",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-300",
      red: "bg-red-100 text-red-800 border-red-300",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getGradientClass = (color: string) => {
    const gradientMap: Record<string, string> = {
      yellow: "from-yellow-400 to-yellow-200",
      orange: "from-orange-400 to-orange-200",
      green: "from-green-400 to-green-200",
      purple: "from-purple-400 to-purple-200",
      blue: "from-blue-400 to-blue-200",
      cyan: "from-cyan-400 to-cyan-200",
      red: "from-red-400 to-red-200",
    };
    return gradientMap[color] || "from-gray-400 to-gray-200";
  };

  // Filter achievements
  let filtered = achievements;
  if (filterType === "unlocked") {
    filtered = achievements.filter((a) => a.isUnlocked);
  } else if (filterType === "locked") {
    filtered = achievements.filter((a) => !a.isUnlocked);
  }

  // Sort achievements
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date") {
      if (!a.unlockedAt) return 1;
      if (!b.unlockedAt) return -1;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      // Sort by type (voting, streaks, favorites)
      const typeOrder: Record<string, number> = {
        first_vote: 1,
        ten_votes: 2,
        fifty_votes: 3,
        hundred_votes: 4,
        three_day_streak: 5,
        seven_day_streak: 6,
        fourteen_day_streak: 7,
        thirty_day_streak: 8,
        favorite_top_ten: 9,
        favorite_top_five: 10,
        favorite_number_one: 11,
      };
      return (typeOrder[a.code] || 999) - (typeOrder[b.code] || 999);
    }
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Badges & Achievements</h2>
            <p className="text-gray-600">Your collection of earned badges and unlocked achievements</p>
          </div>
          <Trophy className="w-12 h-12 text-emerald-600" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Earned Badges</p>
            <p className="text-3xl font-bold text-emerald-600">{unlockedCount}</p>
            <p className="text-xs text-gray-500 mt-1">of {totalCount} total</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Completion</p>
            <p className="text-3xl font-bold text-emerald-600">{completionPercentage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-3xl font-bold text-orange-600">{totalCount - unlockedCount}</p>
            <p className="text-xs text-gray-500 mt-1">to unlock</p>
          </div>
        </div>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className="text-sm"
          >
            All ({totalCount})
          </Button>
          <Button
            variant={filterType === "unlocked" ? "default" : "outline"}
            onClick={() => setFilterType("unlocked")}
            className="text-sm"
          >
            Unlocked ({unlockedCount})
          </Button>
          <Button
            variant={filterType === "locked" ? "default" : "outline"}
            onClick={() => setFilterType("locked")}
            className="text-sm"
          >
            Locked ({totalCount - unlockedCount})
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "type")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              achievement.isUnlocked ? "border-emerald-300 bg-white" : "border-gray-200 bg-gray-50 opacity-75"
            }`}
            onClick={() => setSelectedAchievement(achievement)}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getGradientClass(
                  achievement.color
                )} flex items-center justify-center text-3xl shadow-md`}
              >
                {getAchievementIcon(achievement.code)}
              </div>
              {achievement.isUnlocked && (
                <Badge className="bg-emerald-600 text-white">Unlocked</Badge>
              )}
              {!achievement.isUnlocked && (
                <Badge variant="outline" className="text-gray-600">
                  Locked
                </Badge>
              )}
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>

            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
              </div>
            )}

            {!achievement.isUnlocked && achievement.progress !== undefined && achievement.target !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-700">Progress</span>
                  <span className="text-xs text-gray-600">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {sorted.length === 0 && (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No achievements found</p>
          <p className="text-sm text-gray-500">
            {filterType === "unlocked" && "Keep voting to unlock more achievements!"}
            {filterType === "locked" && "You've unlocked all available achievements!"}
            {filterType === "all" && "No achievements available"}
          </p>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Achievement Details</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4 py-6">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${getGradientClass(
                    selectedAchievement.color
                  )} flex items-center justify-center text-5xl shadow-lg`}
                >
                  {getAchievementIcon(selectedAchievement.code)}
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAchievement.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

                  {selectedAchievement.isUnlocked ? (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <p className="text-sm font-semibold text-emerald-700 mb-1">✓ Unlocked</p>
                      {selectedAchievement.unlockedAt && (
                        <p className="text-xs text-emerald-600">
                          on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      {selectedAchievement.progress !== undefined && selectedAchievement.target !== undefined && (
                        <>
                          <p className="text-sm font-semibold text-blue-700 mb-2">
                            {selectedAchievement.progress}/{selectedAchievement.target} Complete
                          </p>
                          <div className="w-full bg-blue-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all"
                              style={{
                                width: `${Math.min((selectedAchievement.progress / selectedAchievement.target) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            {selectedAchievement.target - selectedAchievement.progress} more to unlock
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {selectedAchievement.isUnlocked && (
                  <Button onClick={() => setShowShareModal(true)} variant="outline" className="w-full mt-2">
                    Share Achievement
                  </Button>
                )}
                <Button onClick={() => setSelectedAchievement(null)} className="w-full mt-2">
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
          </DialogHeader>
          {selectedAchievement && selectedAchievement.isUnlocked && (
            <SocialShareButtons
              shareOptions={{
                title: `I unlocked ${selectedAchievement.name}!`,
                text: generateAchievementShareText(
                  selectedAchievement.name,
                  getAchievementIcon(selectedAchievement.code)
                ),
                url: typeof window !== "undefined" ? window.location.href : "",
                hashtags: ["NationalParkRanker", "Achievement", "Gaming"],
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
