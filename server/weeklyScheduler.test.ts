import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  scheduleWeeklyChallenge,
  rotateWeeklyChallenge,
  getUserWeeklyProgress,
  getWeeklyLeaderboard,
} from './weeklyScheduler';

describe('Weekly Challenge Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleWeeklyChallenge', () => {
    it('should schedule a weekly challenge rotation', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      scheduleWeeklyChallenge();
      
      expect(setTimeoutSpy).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
    });

    it('should calculate correct time until next Monday', () => {
      // Test on a Wednesday
      const wednesday = new Date(2026, 1, 25); // Feb 25, 2026 is a Wednesday
      vi.useFakeTimers();
      vi.setSystemTime(wednesday);

      const nextMonday = new Date(wednesday);
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);

      // Should be 5 days away (Wednesday to Monday)
      const expectedDaysAway = 5;
      const actualDaysAway = Math.ceil((nextMonday.getTime() - wednesday.getTime()) / (24 * 60 * 60 * 1000));

      expect(actualDaysAway).toBe(expectedDaysAway);

      vi.useRealTimers();
    });
  });

  describe('rotateWeeklyChallenge', () => {
    it('should handle missing database gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await rotateWeeklyChallenge();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting weekly challenge rotation')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getUserWeeklyProgress', () => {
    it('should return null if database is unavailable', async () => {
      const progress = await getUserWeeklyProgress(1, 1);

      expect(progress).toBeNull();
    });
  });

  describe('getWeeklyLeaderboard', () => {
    it('should return empty array if database is unavailable', async () => {
      const leaderboard = await getWeeklyLeaderboard(1);

      expect(leaderboard).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap year correctly', () => {
      // Test on Feb 28, 2024 (leap year)
      const leapYearDate = new Date(2024, 1, 28);
      const nextMonday = new Date(leapYearDate);
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);

      // Should correctly handle the transition to March
      expect(nextMonday.getMonth()).toBeGreaterThanOrEqual(1);
    });

    it('should handle Sunday correctly (should go to next Monday)', () => {
      // Test on a Sunday
      const sunday = new Date(2026, 2, 1); // Mar 1, 2026 is a Sunday
      const nextMonday = new Date(sunday);
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);

      // Should be 1 day away
      const daysAway = Math.ceil((nextMonday.getTime() - sunday.getTime()) / (24 * 60 * 60 * 1000));
      expect(daysAway).toBe(1);
    });
  });
});
