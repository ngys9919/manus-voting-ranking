import { describe, expect, it } from "vitest";

/**
 * Calculate new ELO ratings based on match result
 * K-factor of 32 is standard for chess
 */
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

describe("ELO Rating System", () => {
  it("should calculate ratings when equal-rated players compete", () => {
    const { newRating1, newRating2 } = calculateEloRatings(1500, 1500, true);

    expect(newRating1).toBe(1516);
    expect(newRating2).toBe(1484);
  });

  it("should give smaller rating change when higher-rated player wins", () => {
    const { newRating1, newRating2 } = calculateEloRatings(1600, 1400, true);

    expect(newRating1).toBeGreaterThan(1600);
    expect(newRating1 - 1600).toBeLessThan(16);
    expect(newRating2).toBeLessThan(1400);
  });

  it("should give larger rating change when lower-rated player wins", () => {
    const { newRating1, newRating2 } = calculateEloRatings(1400, 1600, true);

    expect(newRating1).toBeGreaterThan(1400);
    expect(newRating1 - 1400).toBeGreaterThan(16);
    expect(newRating2).toBeLessThan(1600);
  });

  it("should preserve total rating sum approximately", () => {
    const initialSum = 1500 + 1500;
    const { newRating1, newRating2 } = calculateEloRatings(1500, 1500, true);
    const newSum = newRating1 + newRating2;

    expect(Math.abs(newSum - initialSum)).toBeLessThanOrEqual(1);
  });

  it("should handle rating changes symmetrically", () => {
    const { newRating1: r1Win, newRating2: r2Lose } = calculateEloRatings(
      1500,
      1500,
      true
    );
    const { newRating1: r1Lose, newRating2: r2Win } = calculateEloRatings(
      1500,
      1500,
      false
    );

    expect(r1Win - 1500).toBe(-(r1Lose - 1500));
    expect(r2Win - 1500).toBe(-(r2Lose - 1500));
  });

  it("should handle extreme rating differences", () => {
    const { newRating1, newRating2 } = calculateEloRatings(2000, 1000, true);

    // When a much higher-rated player wins, they gain very little (rounds to 0 or 1)
    expect(newRating1 - 2000).toBeLessThanOrEqual(1);
    // When a much lower-rated player loses, they lose very little (rounds to 0 or 1)
    expect(1000 - newRating2).toBeLessThanOrEqual(1);
  });
});
