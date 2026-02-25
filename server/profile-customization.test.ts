import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { updateUserProfile, getUserProfile } from "./db";

describe("Profile Customization", () => {
  let testUserId: number;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test user
    const result = await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      displayName: "Original Name",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    testUserId = result[0].insertId as number;
  });

  it("should update user display name", async () => {
    const success = await updateUserProfile(testUserId, "New Display Name");
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.displayName).toBe("New Display Name");
  });

  it("should update user avatar URL", async () => {
    const newAvatarUrl = "https://example.com/new-avatar.jpg";
    const success = await updateUserProfile(testUserId, undefined, newAvatarUrl);
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.avatarUrl).toBe(newAvatarUrl);
  });

  it("should update both display name and avatar URL", async () => {
    const newDisplayName = "Updated Name";
    const newAvatarUrl = "https://example.com/updated-avatar.jpg";

    const success = await updateUserProfile(testUserId, newDisplayName, newAvatarUrl);
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.displayName).toBe(newDisplayName);
    expect(profile?.avatarUrl).toBe(newAvatarUrl);
  });

  it("should get user profile with all fields", async () => {
    const profile = await getUserProfile(testUserId);
    expect(profile).not.toBeNull();
    expect(profile?.id).toBe(testUserId);
    expect(profile?.displayName).toBe("Original Name");
    expect(profile?.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(profile?.name).toBe("Test User");
  });

  it("should handle empty display name", async () => {
    const success = await updateUserProfile(testUserId, "");
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.displayName).toBe("");
  });

  it("should handle null avatar URL", async () => {
    const success = await updateUserProfile(testUserId, "Name", null as any);
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile).not.toBeNull();
  });

  it("should return null for non-existent user", async () => {
    const profile = await getUserProfile(999999);
    expect(profile).toBeNull();
  });

  it("should handle very long display names", async () => {
    const longName = "A".repeat(255);
    const success = await updateUserProfile(testUserId, longName);
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.displayName).toBe(longName);
    expect(profile?.displayName?.length).toBe(255);
  });

  it("should preserve other user fields when updating profile", async () => {
    const success = await updateUserProfile(testUserId, "New Name");
    expect(success).toBe(true);

    const profile = await getUserProfile(testUserId);
    expect(profile?.name).toBe("Test User"); // Original name should be preserved
    expect(profile?.displayName).toBe("New Name");
  });

  it("should handle concurrent profile updates", async () => {
    const updates = [
      updateUserProfile(testUserId, "Name 1"),
      updateUserProfile(testUserId, "Name 2"),
      updateUserProfile(testUserId, "Name 3"),
    ];

    const results = await Promise.all(updates);
    results.forEach((result) => {
      expect(result).toBe(true);
    });

    const profile = await getUserProfile(testUserId);
    expect(profile?.displayName).toBeDefined();
  });
});
