import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { ParkDetailsModal } from "@/components/ParkDetailsModal";
import { Badges } from "@/components/Badges";
import { BadgesGallery } from "@/components/BadgesGallery";
import { Challenges } from "@/components/Challenges";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Park } from "@shared/types";
import { Loader2, Trophy, TrendingUp, Calendar } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.profile.getStatistics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: userVotes, isLoading: votesLoading } = trpc.profile.getUserVotes.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const { data: achievements, isLoading: achievementsLoading } = trpc.profile.getAchievements.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: userChallenges, isLoading: challengesLoading } = trpc.challenges.getUserProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: completedChallenges, isLoading: completedChallengesLoading } = trpc.challenges.getCompleted.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: weeklyBadges, isLoading: weeklyBadgesLoading } = trpc.weeklyStreakChallenges.getUserBadges.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <Button onClick={() => setLocation("/")} variant="default">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={() => setLocation("/")} variant="ghost" className="mb-4">
            ← Back
          </Button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">{user?.name || "User"}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* Profile Edit Form */}
        <div className="mb-8">
          <ProfileEditForm
            currentDisplayName={user?.displayName || ""}
            currentAvatarUrl={user?.avatarUrl || ""}
            onSuccess={() => {
              // Refresh user data if needed
            }}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Votes</p>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mt-2" />
                ) : (
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats?.totalVotes || 0}</p>
                )}
              </div>
              <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Favorite Park</p>
                {statsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mt-2" />
                ) : stats?.favoritePark ? (
                  <p className="text-lg font-bold text-blue-600 mt-2 truncate">{stats.favoritePark.name}</p>
                ) : (
                  <p className="text-gray-500 mt-2">No votes yet</p>
                )}
              </div>
              <Trophy className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Member Since</p>
                {user?.createdAt ? (
                  <p className="text-lg font-bold text-purple-600 mt-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-gray-500 mt-2">-</p>
                )}
              </div>
              <Calendar className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Badges and Achievements Gallery */}
        <div className="mb-8">
          {achievementsLoading ? (
            <Card className="p-8">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            </Card>
          ) : (
            <BadgesGallery achievements={achievements || []} isLoading={achievementsLoading} />
          )}
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Challenges</h2>
          {challengesLoading || completedChallengesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Challenges 
              activeChallenges={userChallenges || []} 
              completedChallenges={completedChallenges || []}
            />
          )}
        </div>

        {/* Weekly Badges */}
        {weeklyBadges && weeklyBadges.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Weekly Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {weeklyBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                  <span className="text-4xl mb-2">{badge.badgeIcon}</span>
                  <p className="font-semibold text-sm text-center">{badge.badgeName}</p>
                  <p className="text-xs text-gray-600 mt-1">{badge.streakLength} day streak</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(badge.awardedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Voting History</h2>

          {votesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : userVotes && userVotes.length > 0 ? (
            <div className="space-y-4">
              {userVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (vote.park) {
                      setSelectedPark(vote.park);
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {vote.park?.imageUrl && (
                      <img
                        src={vote.park.imageUrl}
                        alt={vote.park.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{vote.park?.name}</p>
                      <p className="text-sm text-gray-600">{vote.park?.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(vote.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-green-600">ELO: {vote.park?.eloRating}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No voting history yet</p>
              <Button onClick={() => setLocation("/vote")} variant="default">
                Start Voting
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Park Details Modal */}
      {selectedPark && (
        <ParkDetailsModal
          park={selectedPark}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPark(null);
          }}
        />
      )}
    </div>
  );
}
