import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Parks API", () => {
  const ctx = createPublicContext();
  const caller = appRouter.createCaller(ctx);

  it("should fetch a random matchup with two different parks", async () => {
    const matchup = await caller.parks.getMatchup();

    expect(matchup).toBeDefined();
    expect(matchup?.park1).toBeDefined();
    expect(matchup?.park2).toBeDefined();
    expect(matchup?.park1.id).not.toBe(matchup?.park2.id);
    expect(matchup?.park1.name).toBeDefined();
    expect(matchup?.park1.eloRating).toBeDefined();
  });

  it("should fetch all rankings sorted by ELO rating", async () => {
    const rankings = await caller.parks.getRankings();

    expect(Array.isArray(rankings)).toBe(true);
    expect(rankings.length).toBeGreaterThan(0);

    // Check that rankings are sorted by ELO in descending order
    for (let i = 0; i < rankings.length - 1; i++) {
      const current = parseFloat(rankings[i].eloRating.toString());
      const next = parseFloat(rankings[i + 1].eloRating.toString());
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should fetch recent votes", async () => {
    const recentVotes = await caller.parks.getRecentVotes({ limit: 10 });

    expect(Array.isArray(recentVotes)).toBe(true);
  });

  it("should submit a vote and update ELO ratings", async () => {
    // Get a matchup
    const matchup = await caller.parks.getMatchup();
    expect(matchup).toBeDefined();

    if (!matchup) return;

    const park1Id = matchup.park1.id;
    const park2Id = matchup.park2.id;
    const initialRating1 = parseFloat(matchup.park1.eloRating.toString());
    const initialRating2 = parseFloat(matchup.park2.eloRating.toString());

    // Submit a vote for park1
    const result = await caller.parks.submitVote({
      park1Id,
      park2Id,
      winnerId: park1Id,
    });

    expect(result).toBeDefined();
    expect(result?.park1).toBeDefined();
    expect(result?.park2).toBeDefined();

    // Check that ELO ratings changed
    const newRating1 = result?.park1.eloRating;
    const newRating2 = result?.park2.eloRating;

    expect(newRating1).not.toBe(initialRating1);
    expect(newRating2).not.toBe(initialRating2);

    // Park 1 should have gained rating (won)
    expect(parseFloat(newRating1?.toString() || "0")).toBeGreaterThan(initialRating1);
    // Park 2 should have lost rating
    expect(parseFloat(newRating2?.toString() || "0")).toBeLessThan(initialRating2);
  });

  it("should record votes in recent votes list", async () => {
    // Get a matchup
    const matchup = await caller.parks.getMatchup();
    expect(matchup).toBeDefined();

    if (!matchup) return;

    // Submit a vote
    await caller.parks.submitVote({
      park1Id: matchup.park1.id,
      park2Id: matchup.park2.id,
      winnerId: matchup.park1.id,
    });

    // Check recent votes
    const recentVotes = await caller.parks.getRecentVotes({ limit: 10 });

    expect(recentVotes.length).toBeGreaterThan(0);
    expect(recentVotes[0].park1).toBeDefined();
    expect(recentVotes[0].park2).toBeDefined();
    expect(recentVotes[0].winner).toBeDefined();
  });
});
