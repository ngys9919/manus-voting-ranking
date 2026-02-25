import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Share2, Users, Gift, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ReferralDashboard() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [refereeEmail, setRefereeEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const { data: referralInfo, isLoading } = trpc.referral.getReferralInfo.useQuery();
  const createInviteMutation = trpc.referral.createInvite.useMutation();

  const handleCopyCode = () => {
    if (referralInfo?.referralCode) {
      navigator.clipboard.writeText(referralInfo.referralCode);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const handleSendInvite = async () => {
    if (!refereeEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      await createInviteMutation.mutateAsync({ refereeEmail });
      toast.success("Invitation sent successfully!");
      setRefereeEmail("");
      setShowShareModal(false);
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading referral info...</div>;
  }

  const referralLink = `${window.location.origin}?ref=${referralInfo?.referralCode}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Referral Code Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your Referral Code</h3>
            <Copy className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="bg-muted p-4 rounded-lg mb-4">
            <p className="text-2xl font-bold text-center">{referralInfo?.referralCode}</p>
          </div>
          <Button onClick={handleCopyCode} className="w-full" variant="outline">
            Copy Code
          </Button>
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Referral Stats</h3>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Invites</p>
              <p className="text-2xl font-bold">{referralInfo?.totalInvites || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{referralInfo?.completedReferrals || 0}</p>
            </div>
          </div>
        </Card>

        {/* Rewards Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Total Rewards</h3>
            <Gift className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Bonus Points Earned</p>
              <p className="text-2xl font-bold text-blue-600">{referralInfo?.totalRewardsEarned || 0}</p>
            </div>
            <Badge variant="secondary">Keep inviting to earn more!</Badge>
          </div>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Your Referral Link
        </h3>
        <div className="bg-muted p-4 rounded-lg mb-4 break-all">
          <p className="text-sm font-mono">{referralLink}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast.success("Link copied to clipboard!");
            }}
            className="flex-1"
            variant="outline"
          >
            Copy Link
          </Button>
          <Button onClick={() => setShowShareModal(true)} className="flex-1">
            Send Invitation
          </Button>
        </div>
      </Card>

      {/* Recent Referrals */}
      {referralInfo?.rewards && referralInfo.rewards.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Rewards
          </h3>
          <div className="space-y-3">
            {referralInfo.rewards.slice(0, 5).map((reward: any) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{reward.description}</p>
                  <p className="text-sm text-muted-foreground">+{reward.rewardValue} points</p>
                </div>
                <Badge variant={reward.isRedeemed ? "secondary" : "default"}>
                  {reward.isRedeemed ? "Redeemed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Referral Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Friend's Email</label>
              <Input
                type="email"
                placeholder="friend@example.com"
                value={refereeEmail}
                onChange={(e) => setRefereeEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your friend will receive an invitation to join and can use your referral code to earn bonus rewards!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowShareModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={isInviting} className="flex-1">
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
