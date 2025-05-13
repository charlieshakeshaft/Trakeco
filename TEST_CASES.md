# Green Commute Application Test Cases

This document outlines the specific test scenarios that should be covered by our test suite to ensure all features of the Green Commute application function as expected.

## Authentication Tests

### User Registration
1. **TC-REG-01:** Register as an individual user with valid inputs
2. **TC-REG-02:** Register as a business user with valid inputs
3. **TC-REG-03:** Attempt registration with existing username (should fail)
4. **TC-REG-04:** Attempt registration with invalid email format (should fail)
5. **TC-REG-05:** Attempt registration with password too short (should fail)
6. **TC-REG-06:** Business registration creates a company profile

### User Login
1. **TC-LOG-01:** Login with valid credentials
2. **TC-LOG-02:** Login with invalid username (should fail)
3. **TC-LOG-03:** Login with invalid password (should fail)
4. **TC-LOG-04:** Login with empty fields (should fail)
5. **TC-LOG-05:** Redirected to dashboard after successful login
6. **TC-LOG-06:** Temporary password prompts change on first login

### User Logout
1. **TC-OUT-01:** Logout successfully terminates session
2. **TC-OUT-02:** After logout, protected routes are inaccessible

## Profile Management Tests

### View Profile
1. **TC-PRO-01:** User can view their profile information
2. **TC-PRO-02:** All user details are correctly displayed

### Update Profile
1. **TC-PRO-03:** User can update their name
2. **TC-PRO-04:** User can update their email
3. **TC-PRO-05:** User can set home address and coordinates
4. **TC-PRO-06:** User can set work address and coordinates
5. **TC-PRO-07:** System calculates commute distance accurately
6. **TC-PRO-08:** User can manually adjust calculated distance

## Commute Logging Tests

### Log Creation
1. **TC-COM-01:** User can log walk commute
2. **TC-COM-02:** User can log cycle commute
3. **TC-COM-03:** User can log public transport commute
4. **TC-COM-04:** User can log carpool commute
5. **TC-COM-05:** User can log electric vehicle commute
6. **TC-COM-06:** User can log gas vehicle commute
7. **TC-COM-07:** User can log remote work
8. **TC-COM-08:** User can select specific days of the week
9. **TC-COM-09:** User can specify to/from work for each day
10. **TC-COM-10:** User can log different activities on different days
11. **TC-COM-11:** User cannot log future commutes (should fail)
12. **TC-COM-12:** User cannot log commutes more than 1 week in the past (should fail)

### CO₂ Calculation
1. **TC-CO2-01:** Walking CO₂ calculation is correct (baseline)
2. **TC-CO2-02:** Cycling CO₂ calculation is correct (80%)
3. **TC-CO2-03:** Public transport CO₂ calculation is correct (120%)
4. **TC-CO2-04:** Carpool CO₂ calculation is correct (110%)
5. **TC-CO2-05:** Electric vehicle CO₂ calculation is correct (110%)
6. **TC-CO2-06:** Remote work CO₂ calculation is correct (100%)
7. **TC-CO2-07:** Display shows comparison of methods correctly

## Gamification Tests

### Points System
1. **TC-PTS-01:** Points are awarded correctly for each commute type
2. **TC-PTS-02:** Points total is updated after logging commute
3. **TC-PTS-03:** Points history shows accurate records

### Streaks
1. **TC-STR-01:** Streak increases with consecutive sustainable commutes
2. **TC-STR-02:** Streak resets when a day is missed
3. **TC-STR-03:** Streak display shows correct transport icons
4. **TC-STR-04:** Bonus points awarded for maintained streaks

### Challenges
1. **TC-CHL-01:** User can view available challenges
2. **TC-CHL-02:** User can join a challenge
3. **TC-CHL-03:** Challenge progress updates automatically with commutes
4. **TC-CHL-04:** Challenge completes when goal is reached
5. **TC-CHL-05:** Points are awarded upon challenge completion
6. **TC-CHL-06:** Challenges display correct transportation mode images
7. **TC-CHL-07:** Challenges filter correctly by company

### Rewards
1. **TC-RWD-01:** User can view available rewards
2. **TC-RWD-02:** User can redeem points for rewards
3. **TC-RWD-03:** Points balance decreases after redemption
4. **TC-RWD-04:** Redemption history shows accurate records
5. **TC-RWD-05:** Cannot redeem if points insufficient (should fail)

## Company Feature Tests

### Company Management
1. **TC-COM-01:** Business user can create company
2. **TC-COM-02:** Company domain validates correctly
3. **TC-COM-03:** Company admin can invite team members
4. **TC-COM-04:** Invited users receive temporary passwords
5. **TC-COM-05:** Company users are associated with correct company

### Company Analytics
1. **TC-ANA-01:** Company admin can view company-wide statistics
2. **TC-ANA-02:** CO₂ savings calculated correctly for company
3. **TC-ANA-03:** Company admin can create company-specific challenges
4. **TC-ANA-04:** Company admin can create company-specific rewards

## Leaderboard Tests

1. **TC-LDR-01:** Leaderboard displays users ranked by points
2. **TC-LDR-02:** Leaderboard filters by company correctly
3. **TC-LDR-03:** Leaderboard shows user name, points, streak information

## Dashboard Tests

1. **TC-DSH-01:** Dashboard shows user stats summary
2. **TC-DSH-02:** Dashboard shows active challenges and progress
3. **TC-DSH-03:** Dashboard shows day-by-day commute breakdown
4. **TC-DSH-04:** New users see prompt to set location
5. **TC-DSH-05:** Quick links to log commutes function correctly

## UI/UX Tests

1. **TC-UIX-01:** Application is responsive on mobile devices
2. **TC-UIX-02:** Application is responsive on tablets
3. **TC-UIX-03:** Application is responsive on desktops
4. **TC-UIX-04:** Navigation works between all application sections
5. **TC-UIX-05:** Loading indicators appear during data operations
6. **TC-UIX-06:** Error messages display appropriately
7. **TC-UIX-07:** Success messages display appropriately
8. **TC-UIX-08:** Form validations work properly

## Security Tests

1. **TC-SEC-01:** Unauthenticated users cannot access protected routes
2. **TC-SEC-02:** Users cannot access other users' data
3. **TC-SEC-03:** Company data is only visible to company members
4. **TC-SEC-04:** API endpoints validate authentication
5. **TC-SEC-05:** Passwords are securely hashed

## Performance Tests

1. **TC-PER-01:** Dashboard loads within acceptable time
2. **TC-PER-02:** Commute logging completes within acceptable time
3. **TC-PER-03:** Application handles large amounts of commute data
4. **TC-PER-04:** Application handles large number of users in leaderboard

## User Type Tests

1. **TC-USR-01:** Regular user has appropriate permissions
2. **TC-USR-02:** Admin user has appropriate permissions
3. **TC-USR-03:** New user sees appropriate onboarding elements
4. **TC-USR-04:** Business user can access company features
5. **TC-USR-05:** Individual user cannot access company admin features

## Integration Tests

1. **TC-INT-01:** Commute logging updates points, streaks, and challenges
2. **TC-INT-02:** Challenge completion awards points
3. **TC-INT-03:** Company analytics reflect user commute data
4. **TC-INT-04:** Leaderboard reflects changes in points