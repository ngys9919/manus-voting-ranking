/**
 * Social sharing utilities for achievements and leaderboard rankings
 */

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

/**
 * Generate Twitter share URL
 */
export function getTwitterShareUrl(options: ShareOptions): string {
  const params = new URLSearchParams();
  params.set("text", options.text);
  if (options.url) params.set("url", options.url);
  if (options.hashtags?.length) {
    params.set("hashtags", options.hashtags.join(","));
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(options: ShareOptions): string {
  const params = new URLSearchParams();
  if (options.url) params.set("u", options.url);
  params.set("quote", options.text);
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(options: ShareOptions): string {
  const params = new URLSearchParams();
  if (options.url) params.set("url", options.url);
  params.set("title", options.title);
  params.set("summary", options.text);
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generate achievement share text
 */
export function generateAchievementShareText(
  achievementName: string,
  achievementIcon: string
): string {
  return `🎉 I just unlocked the "${achievementName}" ${achievementIcon} achievement on National Park Ranker! Can you beat my score? #NationalParkRanker #Achievement`;
}

/**
 * Generate leaderboard ranking share text
 */
export function generateLeaderboardShareText(
  rank: number,
  totalVotes: number,
  leaderboardType: "votes" | "achievements" | "streaks"
): string {
  const typeLabel = {
    votes: "Top Voter",
    achievements: "Most Achievements",
    streaks: "Longest Streak",
  }[leaderboardType];

  return `🏆 I'm ranked #${rank} in ${typeLabel} on National Park Ranker with ${totalVotes} ${leaderboardType}! Join the competition and see if you can beat me! #NationalParkRanker #Leaderboard`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Share via native Web Share API if available
 */
export async function shareViaWebAPI(options: ShareOptions): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return true;
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("Error sharing:", error);
    }
    return false;
  }
}

/**
 * Get share URL for a specific platform
 */
export function getShareUrl(
  platform: "twitter" | "facebook" | "linkedin",
  options: ShareOptions
): string {
  switch (platform) {
    case "twitter":
      return getTwitterShareUrl(options);
    case "facebook":
      return getFacebookShareUrl(options);
    case "linkedin":
      return getLinkedInShareUrl(options);
    default:
      return "";
  }
}

/**
 * Open share URL in a new window
 */
export function openShareWindow(url: string, platform: string): void {
  const width = 550;
  const height = 420;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    `${platform}-share`,
    `width=${width},height=${height},left=${left},top=${top}`
  );
}
