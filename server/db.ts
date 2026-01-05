import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, parks, votes, InsertPark } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Parks and Votes functions

export async function getAllParksSortedByElo() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parks: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(parks)
      .orderBy(desc(parks.eloRating));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get parks:", error);
    throw error;
  }
}

export async function getRandomParkPair() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get parks: database not available");
    return null;
  }

  try {
    const allParks = await db.select().from(parks);
    if (allParks.length < 2) return null;

    const idx1 = Math.floor(Math.random() * allParks.length);
    let idx2 = Math.floor(Math.random() * allParks.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * allParks.length);
    }

    return {
      park1: allParks[idx1],
      park2: allParks[idx2],
    };
  } catch (error) {
    console.error("[Database] Failed to get random park pair:", error);
    throw error;
  }
}

export async function getRecentVotes(limit: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get votes: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(votes)
      .orderBy(desc(votes.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get recent votes:", error);
    throw error;
  }
}

export async function getParkById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get park: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(parks)
      .where(eq(parks.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get park:", error);
    throw error;
  }
}

function calculateEloRatings(
  rating1: number,
  rating2: number,
  player1Won: boolean
): { newRating1: number; newRating2: number } {
  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

  const actual1 = player1Won ? 1 : 0;
  const actual2 = player1Won ? 0 : 1;

  const newRating1 = Math.round(rating1 + K * (actual1 - expected1));
  const newRating2 = Math.round(rating2 + K * (actual2 - expected2));

  return { newRating1, newRating2 };
}

export async function recordVote(
  park1Id: number,
  park2Id: number,
  winnerId: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record vote: database not available");
    return null;
  }

  try {
    const park1 = await getParkById(park1Id);
    const park2 = await getParkById(park2Id);

    if (!park1 || !park2) {
      throw new Error("One or both parks not found");
    }

    const { newRating1, newRating2 } = calculateEloRatings(
      parseFloat(park1.eloRating.toString()),
      parseFloat(park2.eloRating.toString()),
      winnerId === park1Id
    );

    await db
      .update(parks)
      .set({ eloRating: newRating1.toString() })
      .where(eq(parks.id, park1Id));

    await db
      .update(parks)
      .set({ eloRating: newRating2.toString() })
      .where(eq(parks.id, park2Id));

    await db
      .update(parks)
      .set({ voteCount: park1.voteCount + 1 })
      .where(eq(parks.id, park1Id));

    await db
      .update(parks)
      .set({ voteCount: park2.voteCount + 1 })
      .where(eq(parks.id, park2Id));

    const vote = await db.insert(votes).values({
      park1Id,
      park2Id,
      winnerId,
    });

    return {
      park1: { ...park1, eloRating: newRating1 },
      park2: { ...park2, eloRating: newRating2 },
      vote,
    };
  } catch (error) {
    console.error("[Database] Failed to record vote:", error);
    throw error;
  }
}

export async function seedParks(parksData: InsertPark[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed parks: database not available");
    return;
  }

  try {
    await db.insert(parks).values(parksData);
    console.log(`[Database] Seeded ${parksData.length} parks`);
  } catch (error) {
    console.error("[Database] Failed to seed parks:", error);
    throw error;
  }
}
