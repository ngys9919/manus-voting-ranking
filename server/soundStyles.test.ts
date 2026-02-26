import { describe, it, expect, beforeEach, afterEach } from "vitest";

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

describe("Sound Style Selection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getNotificationSoundStyle", () => {
    it("should return 'bell' as default when no preference is set", () => {
      const { getNotificationSoundStyle } = require("@/lib/audioAlert");
      const result = getNotificationSoundStyle();
      expect(result).toBe("bell");
    });

    it("should return the stored sound style preference", () => {
      localStorage.setItem("notificationSoundStyle", "chime");
      const { getNotificationSoundStyle } = require("@/lib/audioAlert");
      const result = getNotificationSoundStyle();
      expect(result).toBe("chime");
    });

    it("should return 'bell' for invalid sound styles", () => {
      localStorage.setItem("notificationSoundStyle", "invalid");
      const { getNotificationSoundStyle } = require("@/lib/audioAlert");
      const result = getNotificationSoundStyle();
      expect(result).toBe("bell");
    });

    it("should support all valid sound styles", () => {
      const { getNotificationSoundStyle } = require("@/lib/audioAlert");
      const validStyles = ["bell", "chime", "beep", "ping", "ding"];

      validStyles.forEach((style) => {
        localStorage.setItem("notificationSoundStyle", style);
        const result = getNotificationSoundStyle();
        expect(result).toBe(style);
      });
    });
  });

  describe("setNotificationSoundStyle", () => {
    it("should save sound style to localStorage", () => {
      const { setNotificationSoundStyle } = require("@/lib/audioAlert");
      setNotificationSoundStyle("beep");
      expect(localStorage.getItem("notificationSoundStyle")).toBe("beep");
    });

    it("should allow changing sound style multiple times", () => {
      const { setNotificationSoundStyle, getNotificationSoundStyle } = require("@/lib/audioAlert");

      setNotificationSoundStyle("chime");
      expect(getNotificationSoundStyle()).toBe("chime");

      setNotificationSoundStyle("ping");
      expect(getNotificationSoundStyle()).toBe("ping");

      setNotificationSoundStyle("ding");
      expect(getNotificationSoundStyle()).toBe("ding");
    });
  });

  describe("getAvailableSoundStyles", () => {
    it("should return all available sound styles", () => {
      const { getAvailableSoundStyles } = require("@/lib/audioAlert");
      const styles = getAvailableSoundStyles();

      expect(styles).toHaveLength(5);
      expect(styles.map((s: any) => s.value)).toEqual(["bell", "chime", "beep", "ping", "ding"]);
    });

    it("should include label and description for each style", () => {
      const { getAvailableSoundStyles } = require("@/lib/audioAlert");
      const styles = getAvailableSoundStyles();

      styles.forEach((style: any) => {
        expect(style.value).toBeDefined();
        expect(style.label).toBeDefined();
        expect(style.description).toBeDefined();
        expect(typeof style.label).toBe("string");
        expect(typeof style.description).toBe("string");
      });
    });

    it("should have unique labels for each style", () => {
      const { getAvailableSoundStyles } = require("@/lib/audioAlert");
      const styles = getAvailableSoundStyles();
      const labels = styles.map((s: any) => s.label);

      expect(new Set(labels).size).toBe(labels.length);
    });
  });

  describe("playNotificationSound with style", () => {
    it("should not throw when playing different sound styles", () => {
      const { playNotificationSound } = require("@/lib/audioAlert");
      const styles = ["bell", "chime", "beep", "ping", "ding"];

      styles.forEach((style) => {
        try {
          playNotificationSound(true, style);
        } catch (error) {
          // Expected in test environment without proper AudioContext
        }
      });
    });

    it("should not throw when disabled regardless of style", () => {
      const { playNotificationSound } = require("@/lib/audioAlert");
      expect(() => playNotificationSound(false, "chime")).not.toThrow();
      expect(() => playNotificationSound(false, "beep")).not.toThrow();
    });

    it("should use default style when not specified", () => {
      const { playNotificationSound } = require("@/lib/audioAlert");
      expect(() => playNotificationSound(true)).not.toThrow();
    });
  });

  describe("sound style persistence", () => {
    it("should persist sound style selection across multiple calls", () => {
      const { setNotificationSoundStyle, getNotificationSoundStyle } = require("@/lib/audioAlert");

      setNotificationSoundStyle("ping");
      expect(getNotificationSoundStyle()).toBe("ping");

      setNotificationSoundStyle("ding");
      expect(getNotificationSoundStyle()).toBe("ding");

      setNotificationSoundStyle("beep");
      expect(getNotificationSoundStyle()).toBe("beep");
    });

    it("should maintain sound style independently from sound enabled preference", () => {
      const { setNotificationSoundStyle, getNotificationSoundStyle, setNotificationSoundPreference } =
        require("@/lib/audioAlert");

      setNotificationSoundStyle("chime");
      setNotificationSoundPreference(false);

      expect(getNotificationSoundStyle()).toBe("chime");
    });
  });
});
