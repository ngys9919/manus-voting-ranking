import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Trophy, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Rankings() {
  const [, setLocation] = useLocation();
  const rankingsQuery = trpc.parks.getRankings.useQuery();

  if (rankingsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-slate-600">Loading rankings...</p>
        </div>
      </div>
    );
  }

  const rankings = rankingsQuery.data || [];

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
            <Trophy className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold text-slate-900">National Park Rankings</h1>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <p className="text-sm text-amber-900 mb-1">Total Parks</p>
            <p className="text-3xl font-bold text-amber-900">{rankings.length}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <p className="text-sm text-emerald-900 mb-1">Total Votes</p>
            <p className="text-3xl font-bold text-emerald-900">
              {rankings.reduce((sum, park) => sum + park.voteCount, 0)}
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-blue-900 mb-1">Top Rated</p>
            <p className="text-3xl font-bold text-blue-900">
              {rankings.length > 0 ? Math.round(parseFloat(rankings[0].eloRating.toString())) : 0}
            </p>
          </Card>
        </div>

        {/* Rankings Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Park Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Location</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">ELO Rating</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rankings.map((park, index) => (
                  <tr
                    key={park.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <Trophy
                            className={`w-5 h-5 ${
                              index === 0
                                ? "text-amber-500"
                                : index === 1
                                ? "text-slate-400"
                                : "text-amber-700"
                            }`}
                          />
                        ) : (
                          <span className="text-slate-600 font-semibold w-5">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={park.imageUrl}
                          alt={park.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <span className="font-medium text-slate-900">{park.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{park.location}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900">
                          {Math.round(parseFloat(park.eloRating.toString()))}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">{park.voteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation("/vote")}
            className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg"
          >
            Vote to Change Rankings
          </Button>
        </div>
      </main>
    </div>
  );
}
