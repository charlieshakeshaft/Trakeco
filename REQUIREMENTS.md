# Green Commute Application Requirements

## Overview
Green Commute is a mobile application transforming sustainable transportation tracking into an engaging, interactive experience for eco-conscious employees. The platform leverages advanced gamification techniques to motivate environmentally friendly commuting behaviors.

## User Management

### Authentication
- [x] User can register with username, email, and password
- [x] User can register as individual user or business user
- [x] Business users can create a company profile
- [x] User can log in with username and password
- [x] User can log out of their account
- [x] New users should be prompted to set up home and work locations
- [x] Admin users can invite team members and set initial passwords
- [x] Users can change their temporary passwords after first login

### Profile Management
- [x] User can view their profile information
- [x] User can update their personal information (name, email)
- [x] User can set/update home address and coordinates
- [x] User can set/update work address and coordinates
- [x] System calculates commute distance automatically based on provided addresses
- [x] User can manually adjust calculated commute distance if needed

## Commute Tracking

### Logging Commutes
- [x] User can log different commute types (walk, cycle, public transport, carpool, electric vehicle, gas vehicle, remote work)
- [x] User can log commutes for the current week
- [x] User can log commutes for the previous week
- [x] User cannot log commutes for weeks before the previous week
- [x] User can specify which days they commuted (M-F)
- [x] User can log different activities on different days of the week
- [x] User can specify whether they commuted to work, from work, or both for each day
- [x] System calculates CO₂ saved based on commute type and distance

### Distance Calculation
- [x] Walking counts as baseline distance (100%)
- [x] Cycling counts as 80% of the distance
- [x] Public transport counts as 120% of the distance
- [x] Carpools count as 110% of the distance
- [x] Electric vehicles count as 110% of the distance 
- [x] Remote work counts as 100% of standard commute distance
- [x] Display distance calculations for each commute method for comparison

## Gamification Elements

### Points System
- [x] User earns points for sustainable commutes
- [x] Points are calculated based on commute type and distance
- [x] User can view their total points
- [x] Points history is tracked and viewable by the user

### Streaks
- [x] System tracks consecutive days of sustainable commuting
- [x] User can view their current streak count
- [x] User receives bonus points for maintaining streaks
- [x] Streak information is displayed on dashboard with transport icons for each day

### Challenges
- [x] Users can view available challenges
- [x] Users can join challenges
- [x] Users can track their progress in challenges
- [x] System automatically updates challenge progress based on logged commutes
- [x] Challenges have specific goals (distance, days, commute type)
- [x] Challenges have start and end dates
- [x] Users earn rewards upon completing challenges
- [x] Challenge images show relevant transportation modes

### Rewards
- [x] Users can view available rewards
- [x] Users can redeem points for rewards
- [x] Users can view their reward redemption history
- [x] Rewards can be company-specific or global

## Company Features

### Company Management
- [x] Companies can be created by business users
- [x] Companies have a unique domain for identification
- [x] Companies can have multiple employees

### Company Analytics
- [x] Company admin can view company-wide commuting statistics
- [x] Company admin can view CO₂ savings for the entire company
- [x] Company admin can create company-specific challenges
- [x] Company admin can create company-specific rewards

## Leaderboard
- [x] Users can view leaderboard of top performers
- [x] Leaderboard can be filtered by company
- [x] Leaderboard displays user name, points, and streak information

## Dashboard
- [x] User sees summary of their stats (points, streak, CO₂ saved)
- [x] User sees their active challenges and progress
- [x] User sees day-by-day breakdown of commute information with transport icons
- [x] User sees quick links to log commutes
- [x] New users see prompt to set location if not already set

## User Interface Requirements
- [x] Mobile-responsive design (works on phones, tablets, and desktops)
- [x] Intuitive navigation between features
- [x] Accessible design with proper contrast and text sizing
- [x] Loading indicators during data fetch operations
- [x] Meaningful error messages for failed operations
- [x] Confirmation messages for successful operations

## Technical Requirements
- [x] Data is persisted in PostgreSQL database
- [x] API endpoints are secured with authentication
- [x] Company-specific data is filtered properly
- [x] Session management for authenticated users
- [x] Form validation for all user inputs
- [x] Proper error handling for API requests
- [x] Responsive to different screen sizes
- [x] Comprehensive test suite covering different user types and features

## Development Guidelines
- [x] Modular component architecture
- [x] Consistent code style and formatting
- [x] Descriptive variable and function names
- [x] Comments for complex logic
- [x] Type safety with TypeScript
- [x] Separation of concerns (UI, state, API interactions)

## Implementation Notes
* The "dashboard streak" shows a visual representation of the user's commute methods by day
* Distance calculations show different methods side by side for comparison
* Challenges are visually identified by transportation mode
* Location setting is prominently offered to new users
* Team member invitations include temporary password generation