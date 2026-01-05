import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

export default function Recent() {
  const [, setLocation] = useLocation();
  const recentVotesQuery = trpc.parks.getRecentVotes.useQuery({ limit: 30 });

  if (recentVotesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading recent votes...</p>
        </div>
      </div>
    );
  }

  const votes = recentVotesQuery.data || [];

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
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Recent Votes</h1>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {votes.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-6">No votes yet. Be the first to vote!</p>
            <Button
              onClick={() => setLocation("/vote")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Start Voting
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {votes.map((vote) => (
              <Card
                key={vote.id}
                className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 items-center">
                  {/* Park 1 */}
                  <div className="flex items-center gap-3">
                    {vote.park1 && (
                      <>
                        <img
                          src={vote.park1.imageUrl}
                          alt={vote.park1.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{vote.park1.name}</p>
                          <p className="text-sm text-slate-600">{vote.park1.location}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* VS */}
                  <div className="flex justify-center">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-1">vs</p>
                      {vote.winner && (
                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          {vote.winner.name === vote.park1?.name ? "Park 1 Won" : "Park 2 Won"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Park 2 */}
                  <div className="flex items-center gap-3 justify-end">
                    {vote.park2 && (
                      <>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">{vote.park2.name}</p>
                          <p className="text-sm text-slate-600">{vote.park2.location}</p>
                        </div>
                        <img
                          src={vote.park2.imageUrl}
                          alt={vote.park2.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Winner Badge */}
                {vote.winner && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Winner:</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={vote.winner.imageUrl}
                        alt={vote.winner.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="font-semibold text-slate-900">{vote.winner.name}</span>
                      <span className="text-sm text-emerald-600 font-semibold">
                        {Math.round(parseFloat(vote.winner.eloRating.toString()))} ELO
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation("/vote")}
            className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg"
          >
            Vote Now
          </Button>
        </div>
      </main>
    </div>
  );
}
