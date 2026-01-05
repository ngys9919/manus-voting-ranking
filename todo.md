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
