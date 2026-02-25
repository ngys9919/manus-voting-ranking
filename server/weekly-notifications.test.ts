import { describe, it, expect } from "vitest";
import {
  sendTop3RankingNotifications,
  sendChallengeStartNotifications,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./db";

describe("Weekly Notifications", () => {
  describe("Top 3 Ranking Notifications", () => {
    it("should send notifications for top 3 rankings", async () => {
      const challengeId = 1;
      const notifications = await sendTop3RankingNotifications(challengeId);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it("should have correct notification type for top 3", async () => {
      const challengeId = 1;
      const notifications = await sendTop3RankingNotifications(challengeId);

      notifications.forEach((notification) => {
        expect(notification.type).toBe("top_3_ranking");
      });
    });

    it("should include rank information in notifications", async () => {
      const challengeId = 1;
      const notifications = await sendTop3RankingNotifications(challengeId);

      notifications.forEach((notification) => {
        expect(notification.rank).toBeDefined();
        expect([1, 2, 3]).toContain(notification.rank);
      });
    });

    it("should include badge icon in notifications", async () => {
      const challengeId = 1;
      const notifications = await sendTop3RankingNotifications(challengeId);

      notifications.forEach((notification) => {
        expect(notification.badgeIcon).toBeDefined();
        expect(["🥇", "🥈", "🥉"]).toContain(notification.badgeIcon);
      });
    });
  });

  describe("Challenge Start Notifications", () => {
    it("should send notifications for challenge start", async () => {
      const challengeId = 1;
      const notifications = await sendChallengeStartNotifications(challengeId);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it("should have correct notification type for challenge start", async () => {
      const challengeId = 1;
      const notifications = await sendChallengeStartNotifications(challengeId);

      notifications.forEach((notification) => {
        expect(notification.type).toBe("challenge_start");
      });
    });

    it("should include challenge start message", async () => {
      const challengeId = 1;
      const notifications = await sendChallengeStartNotifications(challengeId);

      notifications.forEach((notification) => {
        expect(notification.message).toContain("challenge");
      });
    });
  });

  describe("User Notifications", () => {
    it("should retrieve user notifications", async () => {
      const userId = 9001;
      const notifications = await getUserNotifications(userId, 10);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const userId = 9001;
      const limit = 5;
      const notifications = await getUserNotifications(userId, limit);

      expect(notifications.length).toBeLessThanOrEqual(limit);
    });

    it("should have required notification fields", async () => {
      const userId = 9001;
      const notifications = await getUserNotifications(userId, 1);

      if (notifications.length > 0) {
        const notification = notifications[0];
        expect(notification).toHaveProperty("id");
        expect(notification).toHaveProperty("userId");
        expect(notification).toHaveProperty("type");
        expect(notification).toHaveProperty("title");
        expect(notification).toHaveProperty("message");
        expect(notification).toHaveProperty("isRead");
        expect(notification).toHaveProperty("createdAt");
      }
    });
  });

  describe("Notification Read Status", () => {
    it("should get unread notification count", async () => {
      const userId = 9001;
      const count = await getUnreadNotificationCount(userId);

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should mark notification as read", async () => {
      const notificationId = 1;
      const success = await markNotificationAsRead(notificationId);

      expect(typeof success).toBe("boolean");
    });

    it("should mark all notifications as read", async () => {
      const userId = 9001;
      const success = await markAllNotificationsAsRead(userId);

      expect(typeof success).toBe("boolean");
    });
  });

  describe("Notification Data Structure", () => {
    it("should have valid notification structure", async () => {
      const userId = 9001;
      const notifications = await getUserNotifications(userId, 1);

      if (notifications.length > 0) {
        const notification = notifications[0];
        expect(typeof notification.userId).toBe("number");
        expect(typeof notification.type).toBe("string");
        expect(typeof notification.title).toBe("string");
        expect(typeof notification.message).toBe("string");
        expect(typeof notification.isRead).toBe("boolean");
      }
    });

    it("should have valid notification types", async () => {
      const userId = 9001;
      const notifications = await getUserNotifications(userId, 20);

      notifications.forEach((notification) => {
        expect(["top_3_ranking", "challenge_start", "challenge_end"]).toContain(
          notification.type
        );
      });
    });
  });
});
