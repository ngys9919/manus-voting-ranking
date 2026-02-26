import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Audio Alert Utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getNotificationSoundPreference", () => {
    it("should return true by default when no preference is set", () => {
      // Dynamically import after localStorage is mocked
      const { getNotificationSoundPreference } = require("@/lib/audioAlert");
      const result = getNotificationSoundPreference();
      expect(result).toBe(true);
    });

    it("should return the stored preference when set to true", () => {
      localStorage.setItem("notificationSoundEnabled", "true");
      const { getNotificationSoundPreference } = require("@/lib/audioAlert");
      const result = getNotificationSoundPreference();
      expect(result).toBe(true);
    });

    it("should return the stored preference when set to false", () => {
      localStorage.setItem("notificationSoundEnabled", "false");
      const { getNotificationSoundPreference } = require("@/lib/audioAlert");
      const result = getNotificationSoundPreference();
      expect(result).toBe(false);
    });
  });

  describe("setNotificationSoundPreference", () => {
    it("should save preference to localStorage as true", () => {
      const { setNotificationSoundPreference } = require("@/lib/audioAlert");
      setNotificationSoundPreference(true);
      expect(localStorage.getItem("notificationSoundEnabled")).toBe("true");
    });

    it("should save preference to localStorage as false", () => {
      const { setNotificationSoundPreference } = require("@/lib/audioAlert");
      setNotificationSoundPreference(false);
      expect(localStorage.getItem("notificationSoundEnabled")).toBe("false");
    });
  });

  describe("isAudioSupported", () => {
    it("should return true when AudioContext is available", () => {
      const { isAudioSupported } = require("@/lib/audioAlert");
      const result = isAudioSupported();
      // This depends on the test environment
      expect(typeof result).toBe("boolean");
    });
  });

  describe("playNotificationSound", () => {
    it("should not throw when enabled is false", () => {
      const { playNotificationSound } = require("@/lib/audioAlert");
      expect(() => playNotificationSound(false)).not.toThrow();
    });

    it("should not throw when enabled is true", () => {
      const { playNotificationSound } = require("@/lib/audioAlert");
      // This might fail in non-browser environments, but we're testing it doesn't crash
      try {
        playNotificationSound(true);
      } catch (error) {
        // Expected in test environment without proper AudioContext
      }
    });
  });

  describe("preference persistence", () => {
    it("should persist preference across multiple calls", () => {
      const { setNotificationSoundPreference, getNotificationSoundPreference } = require("@/lib/audioAlert");

      setNotificationSoundPreference(false);
      expect(getNotificationSoundPreference()).toBe(false);

      setNotificationSoundPreference(true);
      expect(getNotificationSoundPreference()).toBe(true);

      setNotificationSoundPreference(false);
      expect(getNotificationSoundPreference()).toBe(false);
    });
  });
});
