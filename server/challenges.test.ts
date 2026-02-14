import { describe, it, expect, beforeAll } from "vitest";
import {
  getDb,
  seedChallenges,
  getActiveChallenges,
  getUserChallengeProgress,
  updateChallengeProgress,
  getCompletedChallenges,
  CHALLENGE_DEFINITIONS,
} from "./db";

describe("Challenges System", () => {
  beforeAll(async () => {
    await seedChallenges();
  });

  describe("Challenge Definitions", () => {
    it("should have 7 challenge definitions", () => {
      expect(CHALLENGE_DEFINITIONS).toHaveLength(7);
    });

    it("should have 3 monthly and 4 seasonal challenges", () => {
      const monthly = CHALLENGE_DEFINITIONS.filter(c => c.type === "monthly");
      const seasonal = CHALLENGE_DEFINITIONS.filter(c => c.type === "seasonal");
      expect(monthly).toHaveLength(3);
      expect(seasonal).toHaveLength(4);
    });

    it("should have valid challenge structure", () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.code).toBeDefined();
        expect(challenge.name).toBeDefined();
        expect(challenge.targetValue).toBeGreaterThan(0);
      });
    });
  });

  describe("Active Challenges", () => {
    it("should retrieve active challenges", async () => {
      const activeChallenges = await getActiveChallenges();
      expect(Array.isArray(activeChallenges)).toBe(true);
      expect(activeChallenges.length).toBeGreaterThan(0);
    });

    it("should only return active challenges within date range", async () => {
      const activeChallenges = await getActiveChallenges();
      const now = new Date();
      
      activeChallenges.forEach(challenge => {
        expect(challenge.isActive).toBe(true);
        expect(challenge.startDate <= now).toBe(true);
        expect(challenge.endDate >= now).toBe(true);
      });
    });
  });

  describe("Challenge Progress", () => {
    it("should create and update challenge progress", async () => {
      const userId = 6001;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challengeId = activeChallenges[0].id;
      
      await updateChallengeProgress(userId, challengeId, 5);
      await updateChallengeProgress(userId, challengeId, 3);
      
      const progress = await getUserChallengeProgress(userId);
      const userChallenge = progress.find(p => p.challengeId === challengeId);
      expect(userChallenge?.progress).toBe(8);
    });

    it("should mark challenge as completed", async () => {
      const userId = 6002;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];
      
      await updateChallengeProgress(userId, challenge.id, challenge.targetValue);
      
      const progress = await getUserChallengeProgress(userId);
      const userChallenge = progress.find(p => p.challengeId === challenge.id);
      expect(userChallenge?.isCompleted).toBe(true);
    });

    it("should retrieve completed challenges", async () => {
      const userId = 6003;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];
      
      await updateChallengeProgress(userId, challenge.id, challenge.targetValue);
      
      const completed = await getCompletedChallenges(userId);
      expect(Array.isArray(completed)).toBe(true);
      completed.forEach(c => {
        expect(c.isCompleted).toBe(true);
      });
    });
  });

  describe("Database Integrity", () => {
    it("should handle repeated seeding", async () => {
      await seedChallenges();
      await seedChallenges();

      const activeChallenges = await getActiveChallenges();
      expect(activeChallenges.length).toBeGreaterThan(0);
    });

    it("should maintain data consistency", async () => {
      const activeChallenges = await getActiveChallenges();
      const monthlyChallenge = activeChallenges.find(c => c.code === "monthly_votes_25");
      
      expect(monthlyChallenge?.name).toBe("Vote Machine");
      expect(monthlyChallenge?.targetValue).toBe(25);
      expect(monthlyChallenge?.type).toBe("monthly");
    });
  });
});
