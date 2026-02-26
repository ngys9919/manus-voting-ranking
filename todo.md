# National Park Ranker - TODO

## Database & Backend
- [x] Create parks table schema with ELO rating and vote count
- [x] Create votes table schema to record matchups and winners
- [x] Seed initial 63 National Parks with starting ELO rating of 1500
- [x] Implement ELO rating calculation logic
- [x] Create vote submission endpoint that updates ELO ratings
- [x] Create endpoint to fetch random park matchup
- [x] Create endpoint to fetch all parks sorted by ELO rating
- [x] Create endpoint to fetch recent votes (last 20-30)

## Frontend - UI Components
- [x] Build elegant landing/home page with app branding
- [x] Create matchup card component displaying two parks with images and names
- [x] Create vote buttons for selecting winner
- [x] Build rankings leaderboard page
- [x] Build recent votes feed component
- [x] Create navigation between matchup, rankings, and recent votes

## Frontend - Features
- [x] Implement matchup voting flow with ELO updates
- [x] Display real-time rankings after each vote
- [x] Show recent votes feed with timestamps
- [x] Add loading states and animations
- [x] Implement responsive design for mobile and desktop

## Testing & Polish
- [x] Test ELO calculation accuracy
- [x] Test vote submission and ranking updates
- [x] Test UI responsiveness
- [x] Add error handling and user feedback

## Enhancements
- [x] Add skip button to voting interface to get new matchup without voting
- [x] Create park details modal with additional information
- [x] Integrate modal across Vote, Rankings, and Recent Votes pages
- [x] Make park cards clickable to open details modal

## ELO History Tracking
- [x] Create park_elo_history table to track ELO changes over time
- [x] Update vote submission to record ELO history snapshots
- [x] Create API endpoint to fetch ELO history for a park
- [x] Add Recharts line chart to park details modal
- [x] Display ELO rating progression with timestamps


## Bug Fixes
- [x] Fix park images not displaying across all pages (Vote, Rankings, Recent Votes, Modal)


## User Profile Page
- [x] Create userVotes table to track individual user voting history
- [x] Add getUserVotes API endpoint to fetch user's voting history
- [x] Add getUserStatistics API endpoint to calculate total votes and favorite park
- [x] Create Profile.tsx page component with voting history and statistics
- [x] Add profile route to App.tsx navigation
- [x] Display user stats (total votes, favorite park, member since date)
- [x] Show user's recent votes with park details and images
- [x] Add link to profile from navigation header


## Gamification System
- [x] Create achievements table schema with achievement definitions
- [x] Create userAchievements table to track earned achievements
- [x] Define achievement types (First Vote, Milestone Votes, Favorite Park Milestones, etc.)
- [x] Create achievement checking logic on vote submission
- [x] Add API endpoints to fetch user achievements
- [x] Create Badges component to display achievements
- [x] Add achievements section to profile page
- [x] Display achievement notifications when earned
- [x] Add achievement progress indicators


## Seasonal & Monthly Challenges
- [x] Create challenges table schema with challenge definitions
- [x] Create userChallenges table to track challenge progress
- [x] Define monthly challenges (Vote Machine, Park Explorer, Voting Streak)
- [x] Define seasonal challenges (Winter, Spring, Summer, Fall Champions)
- [x] Create API endpoints to fetch active challenges
- [x] Create API endpoints to track user challenge progress
- [x] Implement challenge progress update on vote submission
- [x] Create Challenges component to display active and completed challenges
- [x] Add challenges section to profile page
- [x] Display progress bars and completion status for each challenge
- [x] Show completed challenges gallery
- [x] Auto-seed challenges on server startup


## Challenge Notifications
- [x] Add challenge completion detection logic to identify when users complete challenges
- [x] Create notification helper functions to determine milestone thresholds (75%, 90%, 100%)
- [x] Integrate toast notifications into Vote page for challenge progress updates
- [x] Display "Almost there!" notifications at 75% progress
- [x] Display "Nearly done!" notifications at 90% progress
- [x] Display celebration notifications when challenges are completed


## Voting Streak Notifications
- [x] Add userStreaks table to track consecutive voting days
- [x] Create streak calculation logic to detect consecutive days
- [x] Implement streak milestone notifications (3, 7, 14, 30 days)
- [x] Add streak display to user profile
- [x] Create streak reset logic when user misses a day
- [x] Integrate streak notifications into Vote page
- [x] Add streak badges to achievements system
- [x] Write comprehensive tests for streak logic


## Weekly Streak Challenges
- [x] Create weeklyStreakChallenges table to track weekly competitions
- [x] Create weeklyBadges table for limited-time badge awards
- [x] Implement weekly winner determination logic (top 3 streakers)
- [x] Create weekly challenge reset and new challenge generation
- [x] Add API endpoints for weekly challenge data
- [x] Create WeeklyChallenges UI component
- [x] Display weekly challenge leaderboard on home page
- [x] Show earned weekly badges on profile
- [x] Add weekly challenge notifications when users rank in top 3
- [x] Implement automatic weekly challenge rotation (every Monday)


## Weekly Notifications
- [x] Create weeklyNotifications table to track sent notifications
- [x] Implement notification logic for top 3 rankings
- [x] Implement notification logic for new challenge start
- [x] Create notification sending functions
- [x] Add API endpoints to fetch user notifications
- [x] Integrate notifications into weekly challenge system
- [x] Display notification badges on UI
- [x] Add notification dismiss/read functionality
- [x] Create notification history view
- [x] Write comprehensive tests for notification system


## Badges and Achievements Display
- [x] Create comprehensive BadgesGallery component
- [x] Display earned badges with unlock dates
- [x] Show achievement descriptions and icons
- [x] Add filtering by achievement type
- [x] Add sorting options (by date, name, type)
- [x] Display locked achievements with progress
- [x] Create achievement detail modal
- [x] Add statistics (total earned, completion percentage)
- [x] Integrate into Profile page
- [x] Write comprehensive tests


## Public Leaderboards
- [x] Create API endpoints for top voters leaderboard
- [x] Create API endpoints for most achievements leaderboard
- [x] Create API endpoints for longest streaks leaderboard
- [x] Build Leaderboard page with tab navigation
- [x] Create leaderboard card components with rankings
- [x] Display user avatars and names
- [x] Show ranking position (1st, 2nd, 3rd, etc.)
- [x] Add medal badges for top 3 positions
- [x] Display statistics (votes, achievements, streaks)
- [x] Add pagination for large leaderboards
- [x] Write comprehensive tests for leaderboard functionality


## User Profile Customization
- [x] Add displayName and avatarUrl fields to users table
- [x] Create profile update functions in db.ts
- [x] Add tRPC endpoints for updating profile
- [x] Build profile edit form component
- [x] Implement avatar upload functionality
- [x] Add avatar preview before upload
- [x] Display user avatar on profile page
- [x] Show display name throughout the app
- [x] Add profile update success/error messages
- [x] Write comprehensive tests for profile updates


## Social Sharing Features
- [x] Create social sharing utility functions for generating share text
- [x] Build SocialShareButtons component with Twitter, Facebook, LinkedIn support
- [x] Add achievement sharing with custom messages
- [x] Add leaderboard ranking sharing
- [x] Implement share preview generation
- [x] Add copy-to-clipboard functionality for share links
- [x] Create shareable achievement badges
- [x] Add analytics tracking for shares
- [x] Write comprehensive tests for sharing functionality


## Referral System
- [x] Create referrals table to track referral relationships
- [x] Create referralRewards table for bonus points and badges
- [x] Implement unique referral code generation for each user
- [x] Create referral tracking and validation logic
- [x] Implement reward distribution on successful referrals
- [x] Add exclusive referral badges to achievement system
- [x] Create referral dashboard showing invites and rewards
- [x] Build referral link sharing component
- [x] Add referral statistics to user profile
- [x] Write comprehensive tests for referral system


## Bug Fixes
- [ ] Fix OAuth callback error when voting


## Category-Specific Notification Sounds
- [ ] Design notification category system (achievements, challenges, rankings, etc.)
- [ ] Update audioAlert utility to support per-category sound preferences
- [ ] Add category field to notification data structure
- [ ] Update NotificationPreferences UI with per-category sound selectors
- [ ] Integrate category-specific sounds into NotificationCenter
- [ ] Write tests for category sound selection and playback
- [ ] Verify sound plays correctly for each notification category
