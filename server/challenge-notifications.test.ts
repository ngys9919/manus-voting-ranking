import { describe, it, expect, beforeAll } from "vitest";
import {
  getDb,
  seedChallenges,
  getActiveChallenges,
  updateChallengeProgress,
  getChallengeNotifications,
  getAllChallengeNotifications,
  ChallengeNotification,
} from "./db";

describe("Challenge Notifications", () => {
  beforeAll(async () => {
    await seedChallenges();
  });

  describe("Challenge Notification Detection", () => {
    it("should return empty notifications for new challenges", async () => {
      const userId = 7001;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challengeId = activeChallenges[0].id;

      const notifications = await getChallengeNotifications(userId, challengeId);
      expect(notifications).toHaveLength(0);
    });

    it("should detect 75% milestone", async () => {
      const userId = 7002;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      // Progress to 75%
      const progress75 = Math.floor(challenge.targetValue * 0.75);
      await updateChallengeProgress(userId, challenge.id, progress75);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const milestoneNotif = notifications.find(n => n.type === "milestone" && n.percentage >= 75);
      expect(milestoneNotif).toBeDefined();
      expect(milestoneNotif?.icon).toBe("⚡");
    });

    it("should detect 90% milestone", async () => {
      const userId = 7003;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      // Progress to 90%
      const progress90 = Math.floor(challenge.targetValue * 0.9);
      await updateChallengeProgress(userId, challenge.id, progress90);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const milestoneNotif = notifications.find(n => n.type === "milestone" && n.percentage >= 90);
      expect(milestoneNotif).toBeDefined();
      expect(milestoneNotif?.icon).toBe("🔥");
    });

    it("should detect completion at 100%", async () => {
      const userId = 7004;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      // Progress to 100%
      await updateChallengeProgress(userId, challenge.id, challenge.targetValue);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const completionNotif = notifications.find(n => n.type === "completion");
      expect(completionNotif).toBeDefined();
      expect(completionNotif?.percentage).toBe(100);
      expect(completionNotif?.icon).toBe("🏆");
    });
  });

  describe("Notification Messages", () => {
    it("should have appropriate message for 75% milestone", async () => {
      const userId = 7005;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      const progress75 = Math.floor(challenge.targetValue * 0.75);
      await updateChallengeProgress(userId, challenge.id, progress75);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const milestoneNotif = notifications.find(n => n.percentage >= 75 && n.percentage < 90);
      expect(milestoneNotif?.message).toContain("Almost there");
      expect(milestoneNotif?.message).toContain(challenge.name);
    });

    it("should have appropriate message for 90% milestone", async () => {
      const userId = 7006;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      const progress90 = Math.floor(challenge.targetValue * 0.9);
      await updateChallengeProgress(userId, challenge.id, progress90);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const milestoneNotif = notifications.find(n => n.percentage >= 90 && n.percentage < 100);
      expect(milestoneNotif?.message).toContain("Nearly done");
    });

    it("should have celebration message for completion", async () => {
      const userId = 7007;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      await updateChallengeProgress(userId, challenge.id, challenge.targetValue);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const completionNotif = notifications.find(n => n.type === "completion");
      expect(completionNotif?.message).toContain("Challenge Completed");
      expect(completionNotif?.message).toContain("🎉");
    });
  });

  describe("Multiple Challenge Notifications", () => {
    it("should retrieve notifications for all challenges", async () => {
      const userId = 7008;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length < 2) return;

      // Progress multiple challenges
      for (let i = 0; i < Math.min(2, activeChallenges.length); i++) {
        const challenge = activeChallenges[i];
        const progress = Math.floor(challenge.targetValue * 0.8);
        await updateChallengeProgress(userId, challenge.id, progress);
      }

      const allNotifications = await getAllChallengeNotifications(userId);
      expect(Array.isArray(allNotifications)).toBe(true);
    });
  });

  describe("Notification Structure", () => {
    it("should have required fields in notification", async () => {
      const userId = 7009;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      const progress75 = Math.floor(challenge.targetValue * 0.75);
      await updateChallengeProgress(userId, challenge.id, progress75);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      const notif = notifications[0];

      expect(notif).toHaveProperty("type");
      expect(notif).toHaveProperty("challengeName");
      expect(notif).toHaveProperty("challengeCode");
      expect(notif).toHaveProperty("message");
      expect(notif).toHaveProperty("percentage");
      expect(notif).toHaveProperty("icon");
    });

    it("should have valid notification types", async () => {
      const userId = 7010;
      const activeChallenges = await getActiveChallenges();
      if (activeChallenges.length === 0) return;
      const challenge = activeChallenges[0];

      const progress75 = Math.floor(challenge.targetValue * 0.75);
      await updateChallengeProgress(userId, challenge.id, progress75);

      const notifications = await getChallengeNotifications(userId, challenge.id);
      notifications.forEach(notif => {
        expect(["milestone", "completion"]).toContain(notif.type);
      });
    });
  });
});
