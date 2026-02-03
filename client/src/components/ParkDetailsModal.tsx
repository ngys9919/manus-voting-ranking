import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, TrendingUp, Zap, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import type { Park } from "../../../drizzle/schema";

interface ParkDetailsModalProps {
  park: Park | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ParkDetailsModal({ park, isOpen, onClose }: ParkDetailsModalProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const eloHistoryQuery = trpc.parks.getEloHistory.useQuery(
    { parkId: park?.id || 0, limit: 100 },
    { enabled: !!(park?.id && isOpen) }
  );

  useEffect(() => {
    setIsLoadingHistory(eloHistoryQuery.isLoading);
  }, [eloHistoryQuery.isLoading]);

  useEffect(() => {
    if (eloHistoryQuery.data && eloHistoryQuery.data.length > 0) {
      const data = eloHistoryQuery.data.map((entry, index) => ({
        index,
        eloRating: Math.round(parseFloat(entry.eloRating.toString())),
        timestamp: new Date(entry.createdAt).toLocaleDateString(),
      }));
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [eloHistoryQuery.data]);

  useEffect(() => {
    if (!isOpen) {
      setChartData([]);
    }
  }, [isOpen]);

  if (!park) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{park.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Park Image */}
          <div className="w-full h-48 bg-slate-200 rounded-lg overflow-hidden">
            <img
              src={park.imageUrl}
              alt={park.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600">Location</p>
              <p className="font-medium text-slate-900">{park.location}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* ELO Rating */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-semibold">ELO Rating</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {Math.round(parseFloat(park.eloRating.toString()))}
              </p>
            </div>

            {/* Total Votes */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-semibold">Total Votes</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{park.voteCount}</p>
            </div>
          </div>

          {/* ELO History Chart */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">ELO Rating History</h3>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="index"
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "12px" }}
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                    }}
                    formatter={(value) => [value, "ELO Rating"]}
                    labelFormatter={(index) => `Vote #${index + 1}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="eloRating"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <p className="text-sm">No voting history yet</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
