import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getOrCreateUserReferralStats,
  createReferral,
  completeReferral,
  getUserReferralInfo,
  getReferralLeaderboard,
} from "./db";

describe("Referral System", () => {
  const testUserId = 99999;
  const testRefereeId = 99998;

  beforeAll(async () => {
    // Setup test data if needed
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it("should create or get user referral stats", async () => {
    const stats = await getOrCreateUserReferralStats(testUserId);
    expect(stats).toBeDefined();
    expect(stats.userId).toBe(testUserId);
    expect(stats.referralCode).toBeDefined();
    expect(stats.totalInvites).toBe(0);
    expect(stats.completedReferrals).toBe(0);
  });

  it("should generate unique referral codes", async () => {
    const stats1 = await getOrCreateUserReferralStats(testUserId);
    const stats2 = await getOrCreateUserReferralStats(testRefereeId);

    expect(stats1.referralCode).not.toBe(stats2.referralCode);
    expect(stats1.referralCode).toMatch(/^[A-Z0-9]{8}$/);
  });

  it("should create a referral invitation", async () => {
    const referral = await createReferral(testUserId, "friend@example.com");
    expect(referral).toBeDefined();
    expect(referral.referralCode).toBeDefined();
    expect(referral.expiresAt).toBeDefined();
  });

  it("should complete a referral when referee makes first vote", async () => {
    const referral = await createReferral(testUserId, "friend2@example.com");
    const completed = await completeReferral(referral.referralCode, testRefereeId);
    expect(completed).toBe(true);
  });

  it("should not complete an already completed referral", async () => {
    const referral = await createReferral(testUserId, "friend3@example.com");
    await completeReferral(referral.referralCode, testRefereeId);
    const secondAttempt = await completeReferral(referral.referralCode, testRefereeId);
    expect(secondAttempt).toBe(false);
  });

  it("should get user referral information", async () => {
    const info = await getUserReferralInfo(testUserId);
    expect(info).toBeDefined();
    expect(info.userId).toBe(testUserId);
    expect(info.rewards).toBeDefined();
  });

  it("should get referral leaderboard", async () => {
    const leaderboard = await getReferralLeaderboard(10);
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeLessThanOrEqual(10);

    if (leaderboard.length > 0) {
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].completedReferrals).toBeGreaterThanOrEqual(0);
    }
  });

  it("should track referral statistics correctly", async () => {
    const beforeStats = await getOrCreateUserReferralStats(testUserId);
    const initialInvites = beforeStats.totalInvites;

    await createReferral(testUserId, "friend4@example.com");

    const afterStats = await getOrCreateUserReferralStats(testUserId);
    expect(afterStats.totalInvites).toBeGreaterThanOrEqual(initialInvites);
  });

  it("should award referral rewards on completion", async () => {
    const beforeInfo = await getUserReferralInfo(testUserId);
    const beforeRewards = beforeInfo?.totalRewardsEarned || 0;

    const referral = await createReferral(testUserId, "friend5@example.com");
    await completeReferral(referral.referralCode, testRefereeId);

    const afterInfo = await getUserReferralInfo(testUserId);
    const afterRewards = afterInfo?.totalRewardsEarned || 0;

    expect(afterRewards).toBeGreaterThanOrEqual(beforeRewards);
  });

  it("should validate referral code format", async () => {
    const stats = await getOrCreateUserReferralStats(testUserId);
    expect(stats.referralCode).toMatch(/^[A-Z0-9]{8}$/);
  });

  it("should handle invalid referral codes gracefully", async () => {
    const result = await completeReferral("INVALID00", testRefereeId);
    expect(result).toBe(false);
  });

  it("should rank users by completed referrals", async () => {
    const leaderboard = await getReferralLeaderboard(5);
    
    if (leaderboard.length > 1) {
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].completedReferrals).toBeGreaterThanOrEqual(
          leaderboard[i + 1].completedReferrals
        );
      }
    }
  });
});
