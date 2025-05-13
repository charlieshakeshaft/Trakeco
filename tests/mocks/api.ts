import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockAdminUser, mockRegularUser, mockSoloUser, mockNewUser, mockTempPasswordUser } from '../test-utils';

// Sample data for tests
const mockCommuteData = [
  {
    id: 1,
    user_id: 1,
    week_start: "2025-05-03",
    commute_type: "cycle",
    days_logged: 5,
    distance_km: 25,
    co2_saved_kg: 5,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    monday_to_work: "cycle",
    monday_to_home: "cycle",
    tuesday_to_work: "cycle",
    tuesday_to_home: "cycle",
    wednesday_to_work: "cycle",
    wednesday_to_home: "cycle",
    thursday_to_work: "cycle",
    thursday_to_home: "cycle",
    friday_to_work: "cycle",
    friday_to_home: "cycle",
    saturday_to_work: null,
    saturday_to_home: null,
    sunday_to_work: null,
    sunday_to_home: null,
    created_at: "2025-05-10T12:00:00Z"
  }
];

const mockChallengeData = [
  {
    challenge: {
      id: 1,
      title: "Cycle Challenge",
      description: "Cycle at least 50km this month",
      start_date: "2025-05-01",
      end_date: "2025-05-31",
      points_reward: 100,
      goal_type: "distance",
      goal_value: 50,
      commute_type: "cycle",
      company_id: 1,
      created_at: "2025-04-25T10:00:00Z"
    },
    participant: {
      id: 1,
      challenge_id: 1,
      user_id: 1,
      progress: 25,
      completed: false,
      joined_at: "2025-05-01T10:00:00Z"
    }
  }
];

const mockRewardData = [
  {
    id: 1,
    title: "Free Coffee Voucher",
    description: "Redeem for a free coffee at the company cafe",
    cost_points: 50,
    quantity_limit: 100,
    company_id: 1,
    created_at: "2025-04-01T10:00:00Z"
  }
];

const mockLeaderboardData = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    points_total: 150,
    streak_count: 3
  },
  {
    id: 2,
    name: "Regular User",
    email: "user@example.com",
    points_total: 75,
    streak_count: 1
  }
];

const mockUserStatsData = {
  points: 150,
  streak: 3,
  co2_saved: 15,
  completed_challenges: 2
};

// Define API handlers
export const handlers = [
  // User profile
  http.get('/api/user/profile', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (userId === '1' || !userId) {
      return HttpResponse.json(mockAdminUser, { status: 200 });
    } else if (userId === '2') {
      return HttpResponse.json(mockRegularUser, { status: 200 });
    } else if (userId === '3') {
      return HttpResponse.json(mockSoloUser, { status: 200 });
    } else if (userId === '4') {
      return HttpResponse.json(mockNewUser, { status: 200 });
    } else if (userId === '5') {
      return HttpResponse.json(mockTempPasswordUser, { status: 200 });
    } else {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
  }),
  
  // User stats
  http.get('/api/user/stats', () => {
    return HttpResponse.json(mockUserStatsData, { status: 200 });
  }),
  
  // Commute logs
  http.get('/api/commutes/current', () => {
    return HttpResponse.json(mockCommuteData, { status: 200 });
  }),
  
  // Challenges
  http.get('/api/user/challenges', () => {
    return HttpResponse.json(mockChallengeData, { status: 200 });
  }),
  
  // Rewards
  http.get('/api/rewards', () => {
    return HttpResponse.json(mockRewardData, { status: 200 });
  }),
  
  // Leaderboard
  http.get('/api/leaderboard', () => {
    return HttpResponse.json(mockLeaderboardData, { status: 200 });
  }),
  
  // Update user info (password, status)
  http.patch('/api/user/update', async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    let user;
    
    if (userId === '1' || !userId) {
      user = {...mockAdminUser};
    } else if (userId === '2') {
      user = {...mockRegularUser};
    } else if (userId === '3') {
      user = {...mockSoloUser};
    } else if (userId === '4') {
      user = {...mockNewUser};
    } else if (userId === '5') {
      user = {...mockTempPasswordUser};
    } else {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Apply updates
    const body = await request.json();
    if (body.password) user.password = body.password;
    if (body.is_new_user !== undefined) user.is_new_user = body.is_new_user;
    if (body.needs_password_change !== undefined) user.needs_password_change = body.needs_password_change;
    
    return HttpResponse.json(user, { status: 200 });
  }),
  
  // Update profile location settings
  http.patch('/api/user/update-profile', async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    let user;
    
    if (userId === '1' || !userId) {
      user = {...mockAdminUser};
    } else if (userId === '2') {
      user = {...mockRegularUser};
    } else if (userId === '3') {
      user = {...mockSoloUser};
    } else if (userId === '4') {
      user = {...mockNewUser};
    } else if (userId === '5') {
      user = {...mockTempPasswordUser};
    } else {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Apply updates
    const body = await request.json();
    if (body.home_address) user.home_address = body.home_address;
    if (body.home_latitude) user.home_latitude = body.home_latitude;
    if (body.home_longitude) user.home_longitude = body.home_longitude;
    if (body.work_address) user.work_address = body.work_address;
    if (body.work_latitude) user.work_latitude = body.work_latitude;
    if (body.work_longitude) user.work_longitude = body.work_longitude;
    if (body.commute_distance_km) user.commute_distance_km = body.commute_distance_km;
    
    return HttpResponse.json(user, { status: 200 });
  }),
  
  // Log commute
  rest.post('/api/commutes', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      id: 2,
      ...req.body,
      created_at: new Date().toISOString()
    }));
  }),
  
  // Company members
  rest.get('/api/company/members', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([mockAdminUser, mockRegularUser]));
  })
];

// Setup request interception for tests
export const server = setupServer(...handlers);