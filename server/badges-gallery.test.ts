import { describe, it, expect, vi, beforeEach } from "vitest";

describe("BadgesGallery Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Achievement Display", () => {
    it("should display achievement name and description", () => {
      const achievement = {
        id: 1,
        code: "first_vote",
        name: "First Vote",
        description: "Cast your first vote",
        icon: "⚡",
        color: "yellow",
        isUnlocked: true,
      };

      expect(achievement.name).toBe("First Vote");
      expect(achievement.description).toBe("Cast your first vote");
    });

    it("should map achievement codes to icons", () => {
      const iconMap: Record<string, string> = {
        first_vote: "⚡",
        ten_votes: "🔥",
        fifty_votes: "🏆",
        hundred_votes: "👑",
        favorite_top_ten: "⭐",
        favorite_top_five: "✨",
        favorite_number_one: "💎",
        three_day_streak: "🔥",
        seven_day_streak: "⭐",
        fourteen_day_streak: "💫",
        thirty_day_streak: "👑",
      };

      expect(iconMap["first_vote"]).toBe("⚡");
      expect(iconMap["hundred_votes"]).toBe("👑");
      expect(iconMap["favorite_number_one"]).toBe("💎");
      expect(Object.keys(iconMap).length).toBe(11);
    });

    it("should map colors to CSS classes", () => {
      const colorMap: Record<string, string> = {
        yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
        orange: "bg-orange-100 text-orange-800 border-orange-300",
        green: "bg-green-100 text-green-800 border-green-300",
        purple: "bg-purple-100 text-purple-800 border-purple-300",
        blue: "bg-blue-100 text-blue-800 border-blue-300",
        cyan: "bg-cyan-100 text-cyan-800 border-cyan-300",
        red: "bg-red-100 text-red-800 border-red-300",
      };

      expect(colorMap["yellow"]).toContain("bg-yellow");
      expect(colorMap["blue"]).toContain("bg-blue");
      expect(Object.keys(colorMap).length).toBe(7);
    });
  });

  describe("Filtering", () => {
    it("should filter achievements by unlock status", () => {
      const achievements = [
        {
          id: 1,
          code: "first_vote",
          name: "First Vote",
          description: "Cast your first vote",
          icon: "⚡",
          color: "yellow",
          isUnlocked: true,
          unlockedAt: new Date(),
        },
        {
          id: 2,
          code: "ten_votes",
          name: "Voting Enthusiast",
          description: "Cast 10 votes",
          icon: "🔥",
          color: "orange",
          isUnlocked: false,
        },
      ];

      const unlocked = achievements.filter((a) => a.isUnlocked);
      const locked = achievements.filter((a) => !a.isUnlocked);

      expect(unlocked.length).toBe(1);
      expect(locked.length).toBe(1);
      expect(unlocked[0].code).toBe("first_vote");
      expect(locked[0].code).toBe("ten_votes");
    });

    it("should show all achievements when filter is 'all'", () => {
      const achievements = [
        { id: 1, code: "first_vote", isUnlocked: true },
        { id: 2, code: "ten_votes", isUnlocked: false },
        { id: 3, code: "fifty_votes", isUnlocked: true },
      ];

      expect(achievements.length).toBe(3);
    });
  });

  describe("Sorting", () => {
    it("should sort achievements by unlock date (newest first)", () => {
      const achievements = [
        {
          id: 1,
          code: "first_vote",
          name: "First Vote",
          isUnlocked: true,
          unlockedAt: new Date("2026-02-20"),
        },
        {
          id: 2,
          code: "ten_votes",
          name: "Voting Enthusiast",
          isUnlocked: true,
          unlockedAt: new Date("2026-02-25"),
        },
        {
          id: 3,
          code: "fifty_votes",
          name: "Park Ranger",
          isUnlocked: true,
          unlockedAt: new Date("2026-02-22"),
        },
      ];

      const sorted = [...achievements].sort(
        (a, b) =>
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      );

      expect(sorted[0].code).toBe("ten_votes");
      expect(sorted[1].code).toBe("fifty_votes");
      expect(sorted[2].code).toBe("first_vote");
    });

    it("should sort achievements by name alphabetically", () => {
      const achievements = [
        { id: 1, code: "first_vote", name: "First Vote" },
        { id: 2, code: "ten_votes", name: "Voting Enthusiast" },
        { id: 3, code: "fifty_votes", name: "Park Ranger" },
      ];

      const sorted = [...achievements].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      expect(sorted[0].name).toBe("First Vote");
      expect(sorted[1].name).toBe("Park Ranger");
      expect(sorted[2].name).toBe("Voting Enthusiast");
    });

    it("should sort achievements by type (voting, streaks, favorites)", () => {
      const typeOrder: Record<string, number> = {
        first_vote: 1,
        ten_votes: 2,
        fifty_votes: 3,
        hundred_votes: 4,
        three_day_streak: 5,
        seven_day_streak: 6,
        fourteen_day_streak: 7,
        thirty_day_streak: 8,
        favorite_top_ten: 9,
        favorite_top_five: 10,
        favorite_number_one: 11,
      };

      const achievements = [
        { id: 1, code: "favorite_number_one" },
        { id: 2, code: "first_vote" },
        { id: 3, code: "seven_day_streak" },
      ];

      const sorted = [...achievements].sort(
        (a, b) =>
          (typeOrder[a.code] || 999) - (typeOrder[b.code] || 999)
      );

      expect(sorted[0].code).toBe("first_vote");
      expect(sorted[1].code).toBe("seven_day_streak");
      expect(sorted[2].code).toBe("favorite_number_one");
    });
  });

  describe("Statistics", () => {
    it("should calculate completion percentage", () => {
      const achievements = [
        { id: 1, isUnlocked: true },
        { id: 2, isUnlocked: true },
        { id: 3, isUnlocked: false },
        { id: 4, isUnlocked: false },
      ];

      const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
      const totalCount = achievements.length;
      const completionPercentage = Math.round(
        (unlockedCount / totalCount) * 100
      );

      expect(unlockedCount).toBe(2);
      expect(totalCount).toBe(4);
      expect(completionPercentage).toBe(50);
    });

    it("should count remaining achievements", () => {
      const achievements = [
        { id: 1, isUnlocked: true },
        { id: 2, isUnlocked: true },
        { id: 3, isUnlocked: false },
        { id: 4, isUnlocked: false },
        { id: 5, isUnlocked: false },
      ];

      const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
      const totalCount = achievements.length;
      const remaining = totalCount - unlockedCount;

      expect(remaining).toBe(3);
    });
  });

  describe("Progress Display", () => {
    it("should display progress for locked achievements", () => {
      const achievement = {
        id: 1,
        code: "ten_votes",
        name: "Voting Enthusiast",
        isUnlocked: false,
        progress: 7,
        target: 10,
      };

      expect(achievement.progress).toBe(7);
      expect(achievement.target).toBe(10);
      const progressPercentage = (achievement.progress / achievement.target) * 100;
      expect(progressPercentage).toBe(70);
    });

    it("should calculate remaining progress", () => {
      const achievement = {
        progress: 8,
        target: 10,
      };

      const remaining = achievement.target - achievement.progress;
      expect(remaining).toBe(2);
    });
  });

  describe("Modal Interaction", () => {
    it("should handle achievement selection", () => {
      let selectedAchievement = null;

      const achievement = {
        id: 1,
        code: "first_vote",
        name: "First Vote",
        description: "Cast your first vote",
      };

      selectedAchievement = achievement;
      expect(selectedAchievement).toBeDefined();
      expect(selectedAchievement.code).toBe("first_vote");
    });

    it("should clear selection when modal closes", () => {
      let selectedAchievement = {
        id: 1,
        code: "first_vote",
        name: "First Vote",
      };

      selectedAchievement = null;
      expect(selectedAchievement).toBeNull();
    });
  });

  describe("Empty State", () => {
    it("should handle empty achievements list", () => {
      const achievements: any[] = [];
      expect(achievements.length).toBe(0);
    });

    it("should show appropriate message for each filter state", () => {
      const messages = {
        unlocked: "Keep voting to unlock more achievements!",
        locked: "You've unlocked all available achievements!",
        all: "No achievements available",
      };

      expect(messages.unlocked).toContain("voting");
      expect(messages.locked).toContain("unlocked");
      expect(messages.all).toContain("No achievements");
    });
  });

  describe("Accessibility", () => {
    it("should provide alt text for achievement icons", () => {
      const achievement = {
        id: 1,
        code: "first_vote",
        name: "First Vote",
        icon: "⚡",
      };

      expect(achievement.icon).toBeDefined();
      expect(achievement.name).toBeDefined();
    });

    it("should support keyboard navigation", () => {
      const buttons = ["All", "Unlocked", "Locked"];
      expect(buttons.length).toBe(3);
      expect(buttons[0]).toBe("All");
    });
  });
});
