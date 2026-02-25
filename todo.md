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
