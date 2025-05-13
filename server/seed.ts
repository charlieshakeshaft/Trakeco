import { db } from "./db";
import { 
  users, 
  companies, 
  commuteLogs, 
  challenges, 
  challengeParticipants, 
  rewards 
} from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Check if we already have data
    const userCount = await db.select({ count: { value: users.id } }).from(users);
    if (userCount[0]?.count.value > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    // Create a company
    const [company] = await db.insert(companies).values({
      name: "Eco Corp",
      domain: "ecocorp.com"
    }).returning();
    console.log("Created company:", company);
    
    // Create main user
    const [user] = await db.insert(users).values({
      username: "alex.morgan",
      email: "alex@ecocorp.com",
      name: "Alex Morgan",
      password: "password123",
      company_id: company.id,
      points_total: 820,
      streak_count: 6,
      role: "user"
    }).returning();
    console.log("Created user:", user);
    
    // Create leaderboard users
    const leaderboardUsers = [
      {
        username: "daniel",
        email: "daniel@ecocorp.com",
        name: "Daniel",
        password: "password123",
        company_id: company.id,
        points_total: 1250,
        streak_count: 8,
        role: "user"
      },
      {
        username: "emma",
        email: "emma@ecocorp.com",
        name: "Emma",
        password: "password123",
        company_id: company.id,
        points_total: 980,
        streak_count: 5,
        role: "user"
      },
      {
        username: "robert",
        email: "robert@ecocorp.com",
        name: "Robert",
        password: "password123",
        company_id: company.id,
        points_total: 855,
        streak_count: 4,
        role: "user"
      },
      {
        username: "sarah.johnson",
        email: "sarah@ecocorp.com",
        name: "Sarah Johnson",
        password: "password123",
        company_id: company.id,
        points_total: 840,
        streak_count: 3,
        role: "user"
      },
      {
        username: "mark.thompson",
        email: "mark@ecocorp.com",
        name: "Mark Thompson",
        password: "password123",
        company_id: company.id,
        points_total: 785,
        streak_count: 2,
        role: "user"
      }
    ];
    
    await db.insert(users).values(leaderboardUsers);
    console.log("Created leaderboard users");
    
    // Create a commute log for this week
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    const weekStartStr = currentWeekStart.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const [commuteLog] = await db.insert(commuteLogs).values({
      user_id: user.id,
      week_start: weekStartStr,
      commute_type: "cycle",
      days_logged: 3,
      distance_km: 5,
      co2_saved_kg: 3
    }).returning();
    console.log("Created commute log:", commuteLog);
    
    // Create some challenges
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    
    const [challenge1] = await db.insert(challenges).values({
      title: "Bike to Work Week",
      description: "Cycle to work at least 3 days this week",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      points_reward: 200,
      goal_type: "days",
      goal_value: 3,
      commute_type: "cycle",
      company_id: company.id
    }).returning();
    console.log("Created challenge:", challenge1);
    
    const [challenge2] = await db.insert(challenges).values({
      title: "Public Transit Champion",
      description: "Use public transportation for 10 commutes",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      points_reward: 150,
      goal_type: "days",
      goal_value: 10,
      commute_type: "public_transport",
      company_id: company.id
    }).returning();
    console.log("Created challenge:", challenge2);
    
    // Join a challenge
    const [participant] = await db.insert(challengeParticipants).values({
      user_id: user.id,
      challenge_id: challenge1.id,
      progress: 2,
      completed: false
    }).returning();
    console.log("Created challenge participant:", participant);
    
    // Create rewards
    const reward1 = await db.insert(rewards).values({
      title: "Free Coffee Voucher",
      description: "Get a free coffee at the company cafe",
      cost_points: 200,
      quantity_limit: 50,
      company_id: company.id
    }).returning();
    
    const reward2 = await db.insert(rewards).values({
      title: "Eco-Friendly Water Bottle",
      description: "A reusable water bottle with company logo",
      cost_points: 350,
      quantity_limit: 20,
      company_id: company.id
    }).returning();
    
    const reward3 = await db.insert(rewards).values({
      title: "Plant a Tree Donation",
      description: "We'll plant a tree in your name",
      cost_points: 500,
      quantity_limit: null,
      company_id: company.id
    }).returning();
    
    console.log("Created rewards");
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seedDatabase };