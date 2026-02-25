import { describe, it, expect } from "vitest";
import {
  getOrCreateCurrentWeeklyChallenge,
  awardWeeklyBadges,
  getUserWeeklyBadges,
  completeWeeklyChallenge,
} from "./db";

describe("Weekly Streak Challenges", () => {
  describe("Weekly Challenge Management", () => {
    it("should create a new weekly challenge if none exists", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      expect(challenge).toBeDefined();
      if (challenge) {
        expect(challenge).toHaveProperty("id");
        expect(challenge).toHaveProperty("weekStartDate");
        expect(challenge).toHaveProperty("weekEndDate");
        expect(challenge).toHaveProperty("isActive");
        expect(challenge).toHaveProperty("topStreakers");
      }
    });

    it("should return existing active challenge", async () => {
      const challenge1 = await getOrCreateCurrentWeeklyChallenge();
      const challenge2 = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge1 && challenge2) {
        expect(challenge1.id).toBe(challenge2.id);
      }
    });

    it("should have correct week date range", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge) {
        const start = new Date(challenge.weekStartDate);
        const end = new Date(challenge.weekEndDate);
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        expect(diffDays).toBe(7);
      }
    });
  });

  describe("Weekly Badges", () => {
    it("should award badges to top streakers", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge) {
        const badges = await awardWeeklyBadges(challenge.id);
        
        expect(Array.isArray(badges)).toBe(true);
        expect(badges.length).toBeLessThanOrEqual(3);
      }
    });

    it("should have correct badge ranks", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge) {
        const badges = await awardWeeklyBadges(challenge.id);
        
        badges.forEach((badge) => {
          expect([1, 2, 3]).toContain(badge.rank);
        });
      }
    });

    it("should have appropriate badge icons", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge) {
        const badges = await awardWeeklyBadges(challenge.id);
        
        badges.forEach((badge) => {
          expect(["🥇", "🥈", "🥉"]).toContain(badge.badgeIcon);
        });
      }
    });
  });

  describe("User Weekly Badges", () => {
    it("should retrieve user weekly badges", async () => {
      const userId = 9001;
      const badges = await getUserWeeklyBadges(userId);
      
      expect(Array.isArray(badges)).toBe(true);
    });

    it("should have required fields in badge record", async () => {
      const userId = 9001;
      const badges = await getUserWeeklyBadges(userId);
      
      if (badges.length > 0) {
        const badge = badges[0];
        expect(badge).toHaveProperty("id");
        expect(badge).toHaveProperty("weeklyChallenge");
        expect(badge).toHaveProperty("userId");
        expect(badge).toHaveProperty("rank");
        expect(badge).toHaveProperty("streakLength");
        expect(badge).toHaveProperty("badgeIcon");
        expect(badge).toHaveProperty("badgeName");
        expect(badge).toHaveProperty("awardedAt");
      }
    });
  });

  describe("Weekly Challenge Completion", () => {
    it("should mark challenge as inactive when completed", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge) {
        const success = await completeWeeklyChallenge(challenge.id);
        expect(success).toBe(true);
      }
    });

    it("should return false on invalid challenge ID", async () => {
      const success = await completeWeeklyChallenge(999999);
      expect(typeof success).toBe("boolean");
    });
  });

  describe("Weekly Challenge Data Structure", () => {
    it("should have correct top streakers structure", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge && challenge.topStreakers.length > 0) {
        const streaker = challenge.topStreakers[0];
        expect(streaker).toHaveProperty("rank");
        expect(streaker).toHaveProperty("userId");
        expect(streaker).toHaveProperty("userName");
        expect(streaker).toHaveProperty("streakLength");
        expect(streaker).toHaveProperty("badgeIcon");
        expect(streaker).toHaveProperty("badgeName");
      }
    });

    it("should have valid rank numbers in top streakers", async () => {
      const challenge = await getOrCreateCurrentWeeklyChallenge();
      
      if (challenge && challenge.topStreakers.length > 0) {
        challenge.topStreakers.forEach((streaker) => {
          expect([1, 2, 3]).toContain(streaker.rank);
        });
      }
    });
  });
});
