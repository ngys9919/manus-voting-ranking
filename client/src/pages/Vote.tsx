import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Zap, SkipForward } from "lucide-react";
import { ParkDetailsModal } from "@/components/ParkDetailsModal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Park } from "../../../drizzle/schema";

export default function Vote() {
  const [, setLocation] = useLocation();
  const [isVoting, setIsVoting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleParkClick = (park: Park) => {
    setSelectedPark(park);
    setIsModalOpen(true);
  };

  const matchupQuery = trpc.parks.getMatchup.useQuery();
  const activeChallengesQuery = trpc.challenges.getActive.useQuery();
  const updateChallengeMutation = trpc.challenges.updateProgress.useMutation();
  const submitVoteMutation = trpc.parks.submitVote.useMutation();
  const checkAchievementsMutation = trpc.achievements.checkAndUnlock.useMutation();

  const handleVote = async (winnerId: number) => {
    if (!matchupQuery.data) return;

    setIsVoting(true);
    try {
      await submitVoteMutation.mutateAsync({
        park1Id: matchupQuery.data.park1.id,
        park2Id: matchupQuery.data.park2.id,
        winnerId,
      });

      toast.success("Vote recorded!");
      
      // Update challenge progress
      try {
        const activeChallenges = activeChallengesQuery.data || [];
        for (const challenge of activeChallenges) {
          await updateChallengeMutation.mutateAsync({
            challengeId: challenge.id,
            increment: 1,
          });
        }
      } catch (error) {
        console.error("Failed to update challenge progress", error);
      }
      
      // Check for newly unlocked achievements
      try {
        const unlockedAchievements = await checkAchievementsMutation.mutateAsync();
        if (unlockedAchievements && unlockedAchievements.length > 0) {
          unlockedAchievements.forEach(achievement => {
            toast.success(`Achievement Unlocked: ${achievement.name}!`);
          });
        }
      } catch (error) {
        console.error("Failed to check achievements", error);
      }
      
      // Refetch new matchup
      await matchupQuery.refetch();
    } catch (error) {
      toast.error("Failed to record vote");
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await matchupQuery.refetch();
      toast.info("Skipped to next matchup");
    } catch (error) {
      toast.error("Failed to load next matchup");
      console.error(error);
    } finally {
      setIsSkipping(false);
    }
  };

  if (matchupQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-slate-600">Loading matchup...</p>
        </div>
      </div>
    );
  }

  if (!matchupQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-slate-600 text-center mb-4">No parks available to vote on</p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const { park1, park2 } = matchupQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Which park do you prefer?</h1>
          <Button
            onClick={handleSkip}
            disabled={isSkipping || isVoting}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
            title="Skip to next matchup"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Park 1 */}
          <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleParkClick(park1)}
          >
            <div className="aspect-video overflow-hidden bg-slate-200">
              <img
                src={park1.imageUrl}
                alt={park1.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{park1.name}</h2>
              <p className="text-slate-600 mb-4">{park1.location}</p>
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">ELO Rating</p>
                <p className="text-3xl font-bold text-emerald-600">{Math.round(parseFloat(park1.eloRating.toString()))}</p>
              </div>
              <Button
                onClick={() => handleVote(park1.id)}
                disabled={isVoting || isSkipping}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Voting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Vote for {park1.name}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Park 2 */}
          <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleParkClick(park2)}
          >
            <div className="aspect-video overflow-hidden bg-slate-200">
              <img
                src={park2.imageUrl}
                alt={park2.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{park2.name}</h2>
              <p className="text-slate-600 mb-4">{park2.location}</p>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">ELO Rating</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(parseFloat(park2.eloRating.toString()))}</p>
              </div>
              <Button
                onClick={() => handleVote(park2.id)}
                disabled={isVoting || isSkipping}
                variant="outline"
                className="w-full"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Voting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Vote for {park2.name}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex-1 h-px bg-slate-300" />
          <span className="px-4 text-slate-500 font-semibold">VS</span>
          <div className="flex-1 h-px bg-slate-300" />
        </div>

        {/* Stats */}
        <Card className="p-6 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-4">Vote Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600">{park1.name} Votes</p>
              <p className="text-2xl font-bold text-slate-900">{park1.voteCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">{park2.name} Votes</p>
              <p className="text-2xl font-bold text-slate-900">{park2.voteCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">{park1.name} Rating</p>
              <p className="text-2xl font-bold text-emerald-600">{Math.round(parseFloat(park1.eloRating.toString()))}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">{park2.name} Rating</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(parseFloat(park2.eloRating.toString()))}</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Park Details Modal */}
      <ParkDetailsModal
        park={selectedPark}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
