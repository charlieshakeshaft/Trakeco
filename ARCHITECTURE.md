# Green Commute - Technical Architecture

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Shadcn UI components with Tailwind CSS
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography

### Backend
- **Server Framework**: Express.js with TypeScript
- **API Architecture**: RESTful API design
- **Authentication**: Custom session-based authentication
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Validation**: Zod for schema validation
- **Password Security**: Crypto library for password hashing and comparison

### Database
- **PostgreSQL**: Relational database for data persistence
- **Schemas**: Drizzle schema definitions with relations

### Development Tools
- **Bundler**: Vite for fast development and optimized production builds
- **Testing**: Vitest for unit and integration testing
- **Mocking**: MSW (Mock Service Worker) for API mocking in tests

## System Architecture

### Client-Side Architecture

#### Component Structure
- **Layout Components**: Define the overall page layout and navigation
- **UI Components**: Reusable building blocks for the interface
- **Page Components**: Implement specific views like Dashboard, Profile, etc.
- **Form Components**: Handle user inputs with validation
- **Context Providers**: Provide global state and functionality

#### State Management
- **Server State**: TanStack Query for fetching, caching, and updating server data
- **Form State**: React Hook Form for managing form inputs and validation
- **User Authentication State**: Context API for global auth state

### Server-Side Architecture

#### API Layer
- **Route Handlers**: Process incoming requests and return appropriate responses
- **Middleware**: Handle authentication, logging, and error handling
- **Validation**: Validate request data using Zod schemas

#### Service Layer
- **Storage Service**: Interface for all database operations
- **Authentication Service**: Handle user authentication and session management
- **Business Logic**: Implement application-specific logic

#### Data Layer
- **Schema Definitions**: Define database tables and relationships
- **Migrations**: Handle database schema changes
- **Query Building**: Build and execute database queries

## Database Schema

### Users Table
```
users (
  id: serial (PK)
  username: text (unique)
  email: text (unique)
  name: text
  password: text (hashed)
  company_id: integer (FK to companies)
  points_total: integer
  streak_count: integer
  role: text
  created_at: timestamp
  home_address: text
  home_latitude: text
  home_longitude: text
  work_address: text
  work_latitude: text
  work_longitude: text
  commute_distance_km: integer
  is_new_user: boolean
  needs_password_change: boolean
)
```

### Companies Table
```
companies (
  id: serial (PK)
  name: text
  domain: text
)
```

### Commute Logs Table
```
commute_logs (
  id: serial (PK)
  user_id: integer (FK to users)
  week_start: timestamp
  commute_type: text
  days_logged: integer
  distance_km: integer
  co2_saved_kg: integer
  created_at: timestamp
  monday: boolean
  monday_to_work: text
  monday_from_work: text
  tuesday: boolean
  tuesday_to_work: text
  tuesday_from_work: text
  wednesday: boolean
  wednesday_to_work: text
  wednesday_from_work: text
  thursday: boolean
  thursday_to_work: text
  thursday_from_work: text
  friday: boolean
  friday_to_work: text
  friday_from_work: text
  saturday: boolean
  saturday_to_work: text
  saturday_from_work: text
  sunday: boolean
  sunday_to_work: text
  sunday_from_work: text
)
```

### Points Transactions Table
```
points_transactions (
  id: serial (PK)
  user_id: integer (FK to users)
  source: text
  points: integer
  created_at: timestamp
)
```

### Challenges Table
```
challenges (
  id: serial (PK)
  title: text
  description: text
  start_date: text
  end_date: text
  points_reward: integer
  goal_type: text
  goal_value: integer
  commute_type: text
  company_id: integer (FK to companies)
  created_at: timestamp
)
```

### Challenge Participants Table
```
challenge_participants (
  id: serial (PK)
  challenge_id: integer (FK to challenges)
  user_id: integer (FK to users)
  progress: integer
  completed: boolean
  joined_at: timestamp
)
```

### Rewards Table
```
rewards (
  id: serial (PK)
  title: text
  description: text
  cost_points: integer
  quantity_limit: integer
  company_id: integer (FK to companies)
  created_at: timestamp
)
```

### Redemptions Table
```
redemptions (
  id: serial (PK)
  user_id: integer (FK to users)
  reward_id: integer (FK to rewards)
  redeemed_at: timestamp
)
```

### Sessions Table
```
sessions (
  sid: varchar (PK)
  sess: jsonb
  expire: timestamp
)
```

## Authentication Flow

1. **Registration**:
   - User submits registration form with username, email, password, and user type
   - Server validates the input data
   - Password is hashed using scrypt
   - User record is created in the database
   - User is automatically logged in

2. **Login**:
   - User submits login form with username and password
   - Server retrieves user record by username
   - Server compares submitted password with stored hash
   - On success, creates a session and returns user data
   - Client stores authentication state

3. **Session Management**:
   - Sessions are stored in PostgreSQL database
   - Session ID is sent to the client as a cookie
   - Authenticated requests include session cookie
   - Server validates session on protected routes

4. **Logout**:
   - User requests logout
   - Server destroys the session
   - Client clears authentication state
   - User is redirected to login page

## API Endpoints

### Authentication Endpoints
- `POST /api/login` - Authenticate user
- `POST /api/logout` - End user session
- `GET /api/user` - Get current user data
- `POST /api/register` - Create new user account

### User Endpoints
- `GET /api/user/:id` - Get user details
- `PATCH /api/user/:id` - Update user details
- `GET /api/user/:id/stats` - Get user statistics
- `PATCH /api/user/:id/location` - Update user location settings

### Commute Endpoints
- `POST /api/commutes` - Log new commute
- `GET /api/commutes/user/:userId` - Get user commute history
- `GET /api/commutes/current` - Get current week commute data
- `PATCH /api/commutes/:id` - Update commute log

### Challenge Endpoints
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges` - Create new challenge (admin only)
- `GET /api/challenges/:id` - Get challenge details
- `GET /api/challenges/user/:userId` - Get user's challenges
- `POST /api/challenges/:id/join` - Join a challenge
- `PATCH /api/challenges/progress/:id` - Update challenge progress

### Reward Endpoints
- `GET /api/rewards` - Get all rewards
- `POST /api/rewards` - Create new reward (admin only)
- `GET /api/rewards/:id` - Get reward details
- `POST /api/rewards/:id/redeem` - Redeem a reward
- `GET /api/rewards/user/:userId` - Get user's redeemed rewards

### Company Endpoints
- `GET /api/companies` - Get all companies (admin only)
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get company details
- `GET /api/companies/:id/users` - Get company users
- `GET /api/companies/:id/stats` - Get company statistics

### Leaderboard Endpoints
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/company/:companyId` - Get company leaderboard

## Frontend Routes

- `/` - Dashboard (authenticated users only)
- `/login` - Login page
- `/signup` - Registration page
- `/profile` - User profile page
- `/challenges` - Challenges list page
- `/rewards` - Rewards list page
- `/log-commute` - Commute logging page
- `/leaderboard` - Leaderboard page
- `/company` - Company dashboard (admin users only)

## Security Considerations

1. **Authentication**:
   - Passwords are hashed with scrypt with salting
   - Session data is stored securely in the database
   - Session cookies use secure and HTTP-only flags

2. **Authorization**:
   - Role-based access control for admin features
   - Users can only access their own data
   - Company data is restricted to company members

3. **Data Validation**:
   - All user inputs are validated with Zod schemas
   - API endpoints validate request data
   - Form inputs validate client-side before submission

4. **Error Handling**:
   - Errors are caught and logged appropriately
   - User-facing error messages avoid revealing sensitive information
   - Internal errors are logged for debugging

5. **Rate Limiting**:
   - API endpoints implement rate limiting to prevent abuse

## Testing Strategy

1. **Unit Tests**:
   - Test individual components and functions
   - Mock external dependencies

2. **Integration Tests**:
   - Test interactions between components
   - Test API endpoints with mock database

3. **End-to-End Tests**:
   - Test complete user flows
   - Simulate real user interactions

4. **User Type Tests**:
   - Test application with different user types (admin, regular, new user)
   - Verify permissions and access control

## Deployment Architecture

1. **Environment Configuration**:
   - Development, testing, and production environments
   - Environment-specific configuration via environment variables

2. **Build Process**:
   - Vite builds optimized production assets
   - Server-side TypeScript is compiled to JavaScript

3. **Database Migrations**:
   - Drizzle handles schema changes and migrations
   - Migration scripts are run during deployment

4. **Continuous Integration/Deployment**:
   - Automated testing before deployment
   - Automated deployment to production on successful tests