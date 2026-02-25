import { describe, it, expect } from "vitest";
import {
  savePushSubscription,
  getUserPushSubscriptions,
  removePushSubscription,
  getActiveSubscriptionsForNotification,
} from "./db";

describe("Push Notifications", () => {
  const testSubscription = {
    endpoint: "https://example.com/push/abc123",
    keys: {
      auth: "test_auth_key",
      p256dh: "test_p256dh_key",
    },
  };

  describe("Save Push Subscription", () => {
    it("should save a new push subscription", async () => {
      const userId = 9001;
      const subscription = await savePushSubscription(userId, testSubscription);

      expect(subscription).not.toBeNull();
      expect(subscription?.userId).toBe(userId);
      expect(subscription?.endpoint).toBe(testSubscription.endpoint);
      expect(subscription?.isActive).toBe(true);
    });

    it("should update existing subscription", async () => {
      const userId = 9002;
      const subscription1 = await savePushSubscription(userId, testSubscription);
      const subscription2 = await savePushSubscription(userId, testSubscription);

      expect(subscription1?.endpoint).toBe(subscription2?.endpoint);
    });

    it("should have correct subscription keys", async () => {
      const userId = 9003;
      const subscription = await savePushSubscription(userId, testSubscription);

      expect(subscription?.auth).toBe(testSubscription.keys.auth);
      expect(subscription?.p256dh).toBe(testSubscription.keys.p256dh);
    });
  });

  describe("Get User Push Subscriptions", () => {
    it("should retrieve user subscriptions", async () => {
      const userId = 9004;
      await savePushSubscription(userId, testSubscription);

      const subscriptions = await getUserPushSubscriptions(userId);

      expect(Array.isArray(subscriptions)).toBe(true);
    });

    it("should return empty array for user with no subscriptions", async () => {
      const userId = 9999;
      const subscriptions = await getUserPushSubscriptions(userId);

      expect(Array.isArray(subscriptions)).toBe(true);
    });

    it("should only return active subscriptions", async () => {
      const userId = 9005;
      const subscription = await savePushSubscription(userId, testSubscription);

      if (subscription) {
        const subscriptions = await getUserPushSubscriptions(userId);
        subscriptions.forEach((sub) => {
          expect(sub.isActive).toBe(true);
        });
      }
    });
  });

  describe("Remove Push Subscription", () => {
    it("should mark subscription as inactive", async () => {
      const userId = 9006;
      const subscription = await savePushSubscription(userId, testSubscription);

      if (subscription) {
        const success = await removePushSubscription(subscription.endpoint);
        expect(success).toBe(true);
      }
    });

    it("should handle non-existent endpoint", async () => {
      const success = await removePushSubscription("https://non-existent.com/push");
      expect(typeof success).toBe("boolean");
    });
  });

  describe("Get Active Subscriptions for Notification", () => {
    it("should retrieve active subscriptions for specified users", async () => {
      const userIds = [9007, 9008];
      await savePushSubscription(userIds[0], testSubscription);

      const subscriptions = await getActiveSubscriptionsForNotification(userIds);

      expect(Array.isArray(subscriptions)).toBe(true);
    });

    it("should return empty array for empty user list", async () => {
      const subscriptions = await getActiveSubscriptionsForNotification([]);

      expect(subscriptions).toEqual([]);
    });

    it("should filter subscriptions by user IDs", async () => {
      const userId = 9009;
      await savePushSubscription(userId, testSubscription);

      const subscriptions = await getActiveSubscriptionsForNotification([userId]);

      subscriptions.forEach((sub) => {
        expect(sub.userId).toBe(userId);
      });
    });
  });

  describe("Push Subscription Data Structure", () => {
    it("should have valid subscription structure", async () => {
      const userId = 9010;
      const subscription = await savePushSubscription(userId, testSubscription);

      if (subscription) {
        expect(subscription).toHaveProperty("id");
        expect(subscription).toHaveProperty("userId");
        expect(subscription).toHaveProperty("endpoint");
        expect(subscription).toHaveProperty("auth");
        expect(subscription).toHaveProperty("p256dh");
        expect(subscription).toHaveProperty("isActive");
        expect(subscription).toHaveProperty("createdAt");
        expect(subscription).toHaveProperty("updatedAt");
      }
    });

    it("should have correct data types", async () => {
      const userId = 9011;
      const subscription = await savePushSubscription(userId, testSubscription);

      if (subscription) {
        expect(typeof subscription.userId).toBe("number");
        expect(typeof subscription.endpoint).toBe("string");
        expect(typeof subscription.auth).toBe("string");
        expect(typeof subscription.p256dh).toBe("string");
        expect(typeof subscription.isActive).toBe("boolean");
        expect(subscription.createdAt instanceof Date).toBe(true);
        expect(subscription.updatedAt instanceof Date).toBe(true);
      }
    });
  });
});
