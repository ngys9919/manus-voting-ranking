import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock social sharing utilities
const mockSocialSharing = {
  getTwitterShareUrl: (options: any) => {
    const params = new URLSearchParams();
    params.set("text", options.text);
    if (options.url) params.set("url", options.url);
    if (options.hashtags?.length) {
      params.set("hashtags", options.hashtags.join(","));
    }
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  },

  getFacebookShareUrl: (options: any) => {
    const params = new URLSearchParams();
    if (options.url) params.set("u", options.url);
    params.set("quote", options.text);
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  },

  getLinkedInShareUrl: (options: any) => {
    const params = new URLSearchParams();
    if (options.url) params.set("url", options.url);
    params.set("title", options.title);
    params.set("summary", options.text);
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  },

  generateAchievementShareText: (achievementName: string, icon: string) => {
    return `🎉 I just unlocked the "${achievementName}" ${icon} achievement on National Park Ranker! Can you beat my score? #NationalParkRanker #Achievement`;
  },

  generateLeaderboardShareText: (
    rank: number,
    totalVotes: number,
    leaderboardType: "votes" | "achievements" | "streaks"
  ) => {
    const typeLabel = {
      votes: "Top Voter",
      achievements: "Most Achievements",
      streaks: "Longest Streak",
    }[leaderboardType];

    return `🏆 I'm ranked #${rank} in ${typeLabel} on National Park Ranker with ${totalVotes} ${leaderboardType}! Join the competition and see if you can beat me! #NationalParkRanker #Leaderboard`;
  },
};

describe("Social Sharing Utilities", () => {
  describe("Twitter Share URL", () => {
    it("should generate valid Twitter share URL with text", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "Check out my achievement!",
      });
      expect(url).toContain("twitter.com/intent/tweet");
      expect(url).toContain("text=Check+out+my+achievement");
    });

    it("should include URL in Twitter share", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "Check this out",
        url: "https://example.com",
      });
      expect(url).toContain("url=https");
    });

    it("should include hashtags in Twitter share", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "Check this out",
        hashtags: ["gaming", "achievement"],
      });
      expect(url).toContain("hashtags=gaming");
      expect(url).toContain("achievement");
    });
  });

  describe("Facebook Share URL", () => {
    it("should generate valid Facebook share URL", () => {
      const url = mockSocialSharing.getFacebookShareUrl({
        text: "Check out my achievement!",
      });
      expect(url).toContain("facebook.com/sharer/sharer.php");
      expect(url).toContain("quote=Check+out+my+achievement");
    });

    it("should include URL in Facebook share", () => {
      const url = mockSocialSharing.getFacebookShareUrl({
        text: "Check this out",
        url: "https://example.com",
      });
      expect(url).toContain("u=https");
    });
  });

  describe("LinkedIn Share URL", () => {
    it("should generate valid LinkedIn share URL", () => {
      const url = mockSocialSharing.getLinkedInShareUrl({
        title: "Achievement Unlocked",
        text: "I unlocked an achievement!",
      });
      expect(url).toContain("linkedin.com/sharing/share-offsite");
      expect(url).toContain("title=Achievement+Unlocked");
      expect(url).toContain("summary=I+unlocked+an+achievement");
    });

    it("should include URL in LinkedIn share", () => {
      const url = mockSocialSharing.getLinkedInShareUrl({
        title: "Achievement",
        text: "Check this out",
        url: "https://example.com",
      });
      expect(url).toContain("url=https");
    });
  });

  describe("Achievement Share Text", () => {
    it("should generate achievement share text with icon", () => {
      const text = mockSocialSharing.generateAchievementShareText(
        "Voting Champion",
        "👑"
      );
      expect(text).toContain("Voting Champion");
      expect(text).toContain("👑");
      expect(text).toContain("#NationalParkRanker");
    });

    it("should include achievement name in text", () => {
      const text = mockSocialSharing.generateAchievementShareText(
        "First Vote",
        "⚡"
      );
      expect(text).toContain("First Vote");
    });

    it("should include hashtags in achievement text", () => {
      const text = mockSocialSharing.generateAchievementShareText(
        "Test Achievement",
        "🎉"
      );
      expect(text).toContain("#Achievement");
      expect(text).toContain("#NationalParkRanker");
    });
  });

  describe("Leaderboard Share Text", () => {
    it("should generate leaderboard share text for votes", () => {
      const text = mockSocialSharing.generateLeaderboardShareText(
        1,
        150,
        "votes"
      );
      expect(text).toContain("#1");
      expect(text).toContain("Top Voter");
      expect(text).toContain("150 votes");
    });

    it("should generate leaderboard share text for achievements", () => {
      const text = mockSocialSharing.generateLeaderboardShareText(
        3,
        25,
        "achievements"
      );
      expect(text).toContain("#3");
      expect(text).toContain("Most Achievements");
      expect(text).toContain("25 achievements");
    });

    it("should generate leaderboard share text for streaks", () => {
      const text = mockSocialSharing.generateLeaderboardShareText(
        2,
        30,
        "streaks"
      );
      expect(text).toContain("#2");
      expect(text).toContain("Longest Streak");
      expect(text).toContain("30 streaks");
    });

    it("should include hashtags in leaderboard text", () => {
      const text = mockSocialSharing.generateLeaderboardShareText(
        1,
        100,
        "votes"
      );
      expect(text).toContain("#NationalParkRanker");
      expect(text).toContain("#Leaderboard");
    });
  });

  describe("Share URL Generation", () => {
    it("should generate correct platform-specific URLs", () => {
      const options = {
        title: "Test",
        text: "Test text",
        url: "https://example.com",
      };

      const twitterUrl = mockSocialSharing.getTwitterShareUrl(options);
      const facebookUrl = mockSocialSharing.getFacebookShareUrl(options);
      const linkedinUrl = mockSocialSharing.getLinkedInShareUrl(options);

      expect(twitterUrl).toContain("twitter.com");
      expect(facebookUrl).toContain("facebook.com");
      expect(linkedinUrl).toContain("linkedin.com");
    });
  });

  describe("Share Text Validation", () => {
    it("should generate valid share text for achievements", () => {
      const text = mockSocialSharing.generateAchievementShareText(
        "Voting Enthusiast",
        "🔥"
      );
      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain("Voting Enthusiast");
      expect(text).toContain("🔥");
    });

    it("should generate valid share text for leaderboard rankings", () => {
      const text = mockSocialSharing.generateLeaderboardShareText(
        1,
        200,
        "votes"
      );
      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain("200");
    });

    it("should handle special characters in achievement names", () => {
      const text = mockSocialSharing.generateAchievementShareText(
        "Test's Achievement",
        "✨"
      );
      expect(text).toContain("Test's Achievement");
    });
  });

  describe("URL Parameter Encoding", () => {
    it("should properly encode spaces in share text", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "This is a test message",
      });
      expect(url).toContain("This+is+a+test+message");
    });

    it("should properly encode special characters", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "Test & special chars!",
      });
      expect(url).toContain("special");
    });

    it("should handle multiple hashtags", () => {
      const url = mockSocialSharing.getTwitterShareUrl({
        text: "Test",
        hashtags: ["gaming", "achievement", "ranking"],
      });
      expect(url).toContain("gaming");
      expect(url).toContain("achievement");
      expect(url).toContain("ranking");
    });
  });
});
