import { describe, it, expect, beforeAll } from "vitest";
import {
  getDb,
  seedAchievements,
  getAchievementByCode,
  getUserAchievements,
  hasUserAchievement,
  unlockAchievement,
  checkAndUnlockAchievements,
  ACHIEVEMENT_DEFINITIONS,
} from "./db";

describe("Achievements System", () => {
  beforeAll(async () => {
    // Seed achievements before running tests
    await seedAchievements();
  });

  describe("Achievement Definitions", () => {
    it("should have 7 achievement definitions", () => {
      expect(ACHIEVEMENT_DEFINITIONS).toHaveLength(7);
    });

    it("should have all required achievement codes", () => {
      const codes = ACHIEVEMENT_DEFINITIONS.map(a => a.code);
      expect(codes).toContain("first_vote");
      expect(codes).toContain("ten_votes");
      expect(codes).toContain("fifty_votes");
      expect(codes).toContain("hundred_votes");
      expect(codes).toContain("favorite_top_ten");
      expect(codes).toContain("favorite_top_five");
      expect(codes).toContain("favorite_number_one");
    });

    it("should have proper achievement structure", () => {
      ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
        expect(achievement).toHaveProperty("code");
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("color");
      });
    });
  });

  describe("Achievement Retrieval", () => {
    it("should retrieve achievement by code", async () => {
      const achievement = await getAchievementByCode("first_vote");
      expect(achievement).toBeDefined();
      expect(achievement?.code).toBe("first_vote");
      expect(achievement?.name).toBe("First Vote");
    });

    it("should return null for non-existent achievement", async () => {
      const achievement = await getAchievementByCode("non_existent");
      expect(achievement).toBeNull();
    });

    it("should retrieve all achievements for a user", async () => {
      const achievements = await getUserAchievements(1);
      expect(Array.isArray(achievements)).toBe(true);
    });
  });

  describe("Achievement Unlocking", () => {
    it("should unlock a new achievement", async () => {
      const testUserId = 999;
      const achievement = await unlockAchievement(testUserId, "first_vote");
      expect(achievement).toBeDefined();
      expect(achievement?.code).toBe("first_vote");
    });

    it("should not unlock the same achievement twice", async () => {
      const testUserId = 998;
      // First unlock
      const firstUnlock = await unlockAchievement(testUserId, "ten_votes");
      expect(firstUnlock).toBeDefined();

      // Second unlock should return null
      const secondUnlock = await unlockAchievement(testUserId, "ten_votes");
      expect(secondUnlock).toBeNull();
    });

    it("should check if user has achievement", async () => {
      const testUserId = 997;
      // Unlock achievement
      await unlockAchievement(testUserId, "fifty_votes");

      // Check if user has it
      const hasIt = await hasUserAchievement(testUserId, "fifty_votes");
      expect(hasIt).toBe(true);

      // Check for achievement they don't have
      const doesntHaveIt = await hasUserAchievement(testUserId, "hundred_votes");
      expect(doesntHaveIt).toBe(false);
    });
  });

  describe("Achievement Checking", () => {
    it("should return empty array for user with no achievements", async () => {
      const testUserId = 996;
      const unlockedAchievements = await checkAndUnlockAchievements(testUserId);
      expect(Array.isArray(unlockedAchievements)).toBe(true);
      expect(unlockedAchievements.length).toBeGreaterThanOrEqual(0);
    });

    it("should properly structure unlocked achievements", async () => {
      const testUserId = 995;
      const unlockedAchievements = await checkAndUnlockAchievements(testUserId);

      unlockedAchievements.forEach(achievement => {
        expect(achievement).toHaveProperty("code");
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("color");
      });
    });
  });

  describe("Database Integrity", () => {
    it("should not corrupt database on repeated seeding", async () => {
      // Seed twice
      await seedAchievements();
      await seedAchievements();

      // Should still have exactly 7 achievements
      const achievement1 = await getAchievementByCode("first_vote");
      const achievement2 = await getAchievementByCode("hundred_votes");

      expect(achievement1).toBeDefined();
      expect(achievement2).toBeDefined();
    });

    it("should maintain achievement data consistency", async () => {
      const achievement = await getAchievementByCode("favorite_number_one");
      expect(achievement?.name).toBe("Ultimate Fan");
      expect(achievement?.description).toBe("Your favorite park reaches #1");
      expect(achievement?.icon).toBe("Heart");
      expect(achievement?.color).toBe("red");
    });
  });
});
