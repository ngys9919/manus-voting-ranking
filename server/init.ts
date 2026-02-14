import { getDb, seedAchievements, seedChallenges } from "./db";

export async function initializeDatabase() {
  const db = await getDb();
  if (!db) {
    console.warn("[Init] Database not available, skipping initialization");
    return;
  }

  try {
    console.log("[Init] Seeding achievements...");
    await seedAchievements();
    console.log("[Init] Seeding challenges...");
    await seedChallenges();
    console.log("[Init] Database initialization complete");
  } catch (error) {
    console.error("[Init] Failed to initialize database:", error);
  }
}
