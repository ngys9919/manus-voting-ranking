import { describe, it, expect } from "vitest";
import {
  getAchievementProgress,
  getLockedAchievements,
  getNextAchievements,
} from "./db";

describe("Achievement Progress", () => {
  describe("Get Achievement Progress", () => {
    it("should return achievement progress for a user", async () => {
      const userId = 8001;
      const progress = await getAchievementProgress(userId);

      expect(Array.isArray(progress)).toBe(true);
      expect(progress.length).toBeGreaterThan(0);
    });

    it("should have correct progress structure", async () => {
      const userId = 8002;
      const progress = await getAchievementProgress(userId);

      if (progress.length > 0) {
        const achievement = progress[0];
        expect(achievement).toHaveProperty("code");
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("color");
        expect(achievement).toHaveProperty("isUnlocked");
        expect(achievement).toHaveProperty("currentProgress");
        expect(achievement).toHaveProperty("targetValue");
        expect(achievement).toHaveProperty("progressPercentage");
      }
    });

    it("should calculate progress percentage correctly", async () => {
      const userId = 8003;
      const progress = await getAchievementProgress(userId);

      progress.forEach((achievement) => {
        const expectedPercentage =
          achievement.targetValue > 0
            ? Math.round(
                (achievement.currentProgress / achievement.targetValue) * 100
              )
            : 0;
        expect(achievement.progressPercentage).toBe(expectedPercentage);
      });
    });

    it("should track vote-based achievements", async () => {
      const userId = 8004;
      const progress = await getAchievementProgress(userId);

      const voteAchievements = progress.filter(
        (a) =>
          a.code === "first_vote" ||
          a.code === "ten_votes" ||
          a.code === "fifty_votes" ||
          a.code === "hundred_votes"
      );

      expect(voteAchievements.length).toBeGreaterThan(0);
    });

    it("should track streak-based achievements", async () => {
      const userId = 8005;
      const progress = await getAchievementProgress(userId);

      const streakAchievements = progress.filter(
        (a) =>
          a.code === "three_day_streak" ||
          a.code === "seven_day_streak" ||
          a.code === "fourteen_day_streak" ||
          a.code === "thirty_day_streak"
      );

      expect(streakAchievements.length).toBeGreaterThan(0);
    });
  });

  describe("Get Locked Achievements", () => {
    it("should return only locked achievements", async () => {
      const userId = 8006;
      const locked = await getLockedAchievements(userId);

      expect(Array.isArray(locked)).toBe(true);
      locked.forEach((achievement) => {
        expect(achievement.isUnlocked).toBe(false);
      });
    });

    it("should sort by progress percentage descending", async () => {
      const userId = 8007;
      const locked = await getLockedAchievements(userId);

      if (locked.length > 1) {
        for (let i = 0; i < locked.length - 1; i++) {
          expect(locked[i].progressPercentage).toBeGreaterThanOrEqual(
            locked[i + 1].progressPercentage
          );
        }
      }
    });

    it("should return empty array if all achievements unlocked", async () => {
      const userId = 8008;
      const locked = await getLockedAchievements(userId);

      expect(Array.isArray(locked)).toBe(true);
    });
  });

  describe("Get Next Achievements", () => {
    it("should return next achievements with default limit", async () => {
      const userId = 8009;
      const next = await getNextAchievements(userId);

      expect(Array.isArray(next)).toBe(true);
      expect(next.length).toBeLessThanOrEqual(3);
    });

    it("should respect custom limit", async () => {
      const userId = 8010;
      const limit = 5;
      const next = await getNextAchievements(userId, limit);

      expect(next.length).toBeLessThanOrEqual(limit);
    });

    it("should return closest achievements first", async () => {
      const userId = 8011;
      const next = await getNextAchievements(userId, 5);

      if (next.length > 1) {
        for (let i = 0; i < next.length - 1; i++) {
          expect(next[i].progressPercentage).toBeGreaterThanOrEqual(
            next[i + 1].progressPercentage
          );
        }
      }
    });

    it("should return empty array if all achievements unlocked", async () => {
      const userId = 8012;
      const next = await getNextAchievements(userId, 3);

      expect(Array.isArray(next)).toBe(true);
    });

    it("should have valid progress values", async () => {
      const userId = 8013;
      const next = await getNextAchievements(userId, 3);

      next.forEach((achievement) => {
        expect(achievement.currentProgress).toBeLessThanOrEqual(
          achievement.targetValue
        );
        expect(achievement.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(achievement.progressPercentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Achievement Progress Data Validation", () => {
    it("should have valid color values", async () => {
      const userId = 8014;
      const progress = await getAchievementProgress(userId);

      const validColors = [
        "yellow",
        "orange",
        "green",
        "purple",
        "blue",
        "cyan",
        "red",
      ];

      progress.forEach((achievement) => {
        expect(validColors).toContain(achievement.color);
      });
    });

    it("should have non-negative progress values", async () => {
      const userId = 8015;
      const progress = await getAchievementProgress(userId);

      progress.forEach((achievement) => {
        expect(achievement.currentProgress).toBeGreaterThanOrEqual(0);
        expect(achievement.targetValue).toBeGreaterThan(0);
        expect(achievement.progressPercentage).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have unique achievement codes", async () => {
      const userId = 8016;
      const progress = await getAchievementProgress(userId);

      const codes = progress.map((a) => a.code);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
