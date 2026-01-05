import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mountain, Trophy, Clock } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Mountain className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">National Park Ranker</h1>
          </div>
          <p className="text-slate-600 mt-2">Vote on your favorite parks and see how they rank</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Vote Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/vote')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Mountain className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Vote Now</h2>
              <p className="text-slate-600 mb-6">Compare two parks head-to-head and vote for your favorite</p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Start Voting</Button>
            </div>
          </Card>

          {/* Rankings Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/rankings')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Rankings</h2>
              <p className="text-slate-600 mb-6">See the complete leaderboard of all 63 national parks</p>
              <Button variant="outline" className="w-full">View Rankings</Button>
            </div>
          </Card>

          {/* Recent Votes Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/recent')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Recent Votes</h2>
              <p className="text-slate-600 mb-6">See what other users have been voting on</p>
              <Button variant="outline" className="w-full">View Recent</Button>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">1. Vote</h3>
              <p className="text-slate-600">Compare two random parks and vote for your favorite in head-to-head matchups.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">2. ELO Rating</h3>
              <p className="text-slate-600">Each park's rating changes based on votes using the chess ELO system.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">3. Rank</h3>
              <p className="text-slate-600">Watch the rankings update in real-time as the community votes.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
