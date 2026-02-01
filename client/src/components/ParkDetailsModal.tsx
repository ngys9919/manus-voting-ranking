import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, TrendingUp, Zap } from "lucide-react";
import type { Park } from "../../../drizzle/schema";

interface ParkDetailsModalProps {
  park: Park | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ParkDetailsModal({ park, isOpen, onClose }: ParkDetailsModalProps) {
  if (!park) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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

          {/* Additional Details Message */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
            <p className="text-sm text-slate-600">Additional park details coming soon!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
