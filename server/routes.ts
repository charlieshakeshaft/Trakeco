import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCompanySchema, 
  insertCommuteLogSchema, 
  insertPointsTransactionSchema,
  insertChallengeSchema,
  insertChallengeParticipantSchema,
  insertRewardSchema,
  insertRedemptionSchema,
  commuteTypes
} from "@shared/schema";

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: Function) => {
  try {
    // Check if user is logged in via the session
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      // If no session, check if userId is provided as a query param (for development)
      // In production, we would remove this fallback
      if (req.query.userId) {
        const user = await storage.getUser(Number(req.query.userId));
        if (user) {
          (req as any).user = user;
          return next();
        }
      }
      
      // For development mode, provide a default user 
      if (process.env.NODE_ENV === "development") {
        const defaultUser = await storage.getUser(7); // Use ID 7 from the seed data
        if (defaultUser) {
          console.log("Using default development user:", defaultUser.username);
          (req as any).user = defaultUser;
          return next();
        }
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Attach user to request for use in route handlers
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Check if company exists if company_id is provided
      if (userData.company_id) {
        const company = await storage.getCompany(userData.company_id);
        if (!company) {
          return res.status(400).json({ message: "Company not found" });
        }
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user ID in session
      (req as any).session.userId = user.id;
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // Clear session data
    if ((req as any).session) {
      (req as any).session.userId = null;
      (req as any).session.destroy(() => {
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  });
  
  app.get("/api/user/profile", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get the company information if the user has a company_id
      let company = null;
      if (user.company_id) {
        company = await storage.getCompany(user.company_id);
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        company
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile" });
    }
  });
  
  // Company routes
  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      
      // Check if company with this domain already exists
      if (companyData.domain) {
        const existingCompany = await storage.getCompanyByDomain(companyData.domain);
        if (existingCompany) {
          return res.status(400).json({ message: "Company with this domain already exists" });
        }
      }
      
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating company" });
    }
  });
  
  // Commute routes
  app.post("/api/commutes", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      const commuteSchema = insertCommuteLogSchema.extend({
        commute_type: z.string().refine(val => commuteTypes.options.includes(val as any), {
          message: "Invalid commute type"
        }),
        // Ensure days_logged matches the number of selected days
        days_logged: z.number().superRefine((val, ctx) => {
          if (ctx.parent) {
            const data = ctx.parent;
            const selectedDays = [
              !!data.monday,
              !!data.tuesday,
              !!data.wednesday,
              !!data.thursday,
              !!data.friday,
              !!data.saturday,
              !!data.sunday
            ].filter(Boolean).length;
            
            if (val !== selectedDays) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Days logged (${val}) must match the number of selected days (${selectedDays})`
              });
              return false;
            }
          }
          return true;
        })
      });
      
      // Prefer the user_id from the request body if provided, otherwise use the authenticated user's ID
      // This helps in development when using query param authentication
      const userId = req.body.user_id || user.id;
      
      const commuteData = commuteSchema.parse({
        ...req.body,
        user_id: Number(userId) // Ensure it's a number
      });
      
      // Check if user already has a commute log for this week
      const weekStart = new Date(commuteData.week_start);
      const existingLog = await storage.getCommuteLogByUserIdAndWeek(Number(userId), weekStart);
      
      if (existingLog) {
        // Check if it's still the same week
        const currentDate = new Date();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        if (currentDate <= weekEnd) {
          // Update existing log instead of creating a new one
          const updatedLog = await storage.updateCommuteLog(existingLog.id, commuteData);
          return res.json(updatedLog);
        }
      }
      
      const commuteLog = await storage.createCommuteLog(commuteData);
      
      // Award points for the commute
      const pointsEarned = calculateCommutePoints(commuteData.commute_type, commuteData.days_logged);
      
      if (pointsEarned > 0) {
        await storage.createPointsTransaction({
          user_id: user.id,
          source: `${commuteData.commute_type} commute`,
          points: pointsEarned
        });
      }
      
      // Update challenge progress for matching challenges
      await updateChallengeProgressForCommute(userId, commuteData);
      
      res.status(201).json(commuteLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error logging commute" });
    }
  });
  
  app.get("/api/commutes", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      // Use query param userId if provided, otherwise use authenticated user
      const userId = req.query.userId ? Number(req.query.userId) : user.id;
      const commuteLogs = await storage.getCommuteLogsByUserId(userId);
      res.json(commuteLogs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching commute logs" });
    }
  });
  
  app.get("/api/commutes/current", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Use query param userId if provided, otherwise use authenticated user
      const userId = req.query.userId ? Number(req.query.userId) : user.id;
      
      // Get the start of the current week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      console.log("Getting commute logs for user:", userId, "with week start:", weekStart.toISOString());
      const commuteLogs = await storage.getCommuteLogsByUserId(userId);
      
      // Filter logs for current week
      const currentWeekLogs = commuteLogs.filter(log => {
        // Handle potential parsing issues
        try {
          const logWeekStart = new Date(log.week_start);
          // Use date comparison only, ignoring time
          return logWeekStart.toDateString() === weekStart.toDateString();
        } catch (error) {
          console.error("Error parsing week_start", log.week_start, error);
          return false;
        }
      });
      
      res.json(currentWeekLogs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching current commute logs" });
    }
  });
  
  // Commute breakdown for profile page
  app.get("/api/commutes/breakdown", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const commuteLogs = await storage.getCommuteLogsByUserId(user.id);
      
      // Count occurrences of each commute type
      const commuteTypeCounts: Record<string, number> = {};
      let totalDays = 0;
      
      commuteLogs.forEach(log => {
        if (!commuteTypeCounts[log.commute_type]) {
          commuteTypeCounts[log.commute_type] = 0;
        }
        commuteTypeCounts[log.commute_type] += log.days_logged;
        totalDays += log.days_logged;
      });
      
      // Convert to array and sort by frequency
      const breakdown = Object.entries(commuteTypeCounts)
        .map(([type, days]) => ({
          type,
          days,
          percentage: totalDays > 0 ? Math.round((days / totalDays) * 100) : 0
        }))
        .sort((a, b) => b.days - a.days);
      
      res.json({
        breakdown,
        totalDays
      });
    } catch (error) {
      console.error("Error getting commute breakdown:", error);
      res.status(500).json({ message: "Error fetching commute breakdown" });
    }
  });
  
  // Challenge routes
  app.get("/api/challenges", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const challenges = await storage.getChallenges(user.company_id);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });
  
  app.put("/api/challenges/:challengeId", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const challengeId = parseInt(req.params.challengeId);
      
      // Check if user is an admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update challenges" });
      }
      
      // Get the challenge
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if challenge belongs to the user's company
      if (challenge.company_id !== user.company_id) {
        return res.status(403).json({ message: "You can only update challenges for your company" });
      }
      
      // Update the challenge
      const updatedChallenge = await storage.updateChallenge(challengeId, req.body);
      if (!updatedChallenge) {
        return res.status(404).json({ message: "Failed to update challenge" });
      }
      
      res.json(updatedChallenge);
    } catch (error) {
      res.status(500).json({ message: "Error updating challenge" });
    }
  });
  
  app.delete("/api/challenges/:challengeId", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const challengeId = parseInt(req.params.challengeId);
      
      // Check if user is an admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete challenges" });
      }
      
      // Get the challenge
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if challenge belongs to the user's company
      if (challenge.company_id !== user.company_id) {
        return res.status(403).json({ message: "You can only delete challenges for your company" });
      }
      
      // Delete the challenge
      const success = await storage.deleteChallenge(challengeId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete challenge" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting challenge" });
    }
  });
  
  app.post("/api/challenges", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Check if user is an admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create challenges" });
      }
      
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        company_id: user.company_id
      });
      
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating challenge" });
    }
  });
  
  app.post("/api/challenges/:challengeId/join", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : user.id;
      const challengeId = parseInt(req.params.challengeId);
      
      // Check if challenge exists
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if user is already participating
      const userChallenges = await storage.getUserChallenges(userId);
      const isAlreadyParticipating = userChallenges.some(
        uc => uc.challenge.id === challengeId
      );
      
      if (isAlreadyParticipating) {
        return res.status(400).json({ message: "User is already participating in this challenge" });
      }
      
      const participant = await storage.joinChallenge({
        challenge_id: challengeId,
        user_id: userId,
        progress: 0,
        completed: false
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ message: "Error joining challenge" });
    }
  });
  
  app.get("/api/user/challenges", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : user.id;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user challenges" });
    }
  });
  
  // Reward routes
  app.get("/api/rewards", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const rewards = await storage.getRewards(user.company_id);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching rewards" });
    }
  });
  
  app.post("/api/rewards", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Check if user is an admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create rewards" });
      }
      
      const rewardData = insertRewardSchema.parse({
        ...req.body,
        company_id: user.company_id
      });
      
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating reward" });
    }
  });
  
  app.post("/api/rewards/:rewardId/redeem", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const rewardId = parseInt(req.params.rewardId);
      
      // Check if reward exists
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if user has enough points
      if (user.points_total < reward.cost_points) {
        return res.status(400).json({ 
          message: "Not enough points",
          pointsNeeded: reward.cost_points - user.points_total
        });
      }
      
      const redemption = await storage.redeemReward({
        user_id: user.id,
        reward_id: rewardId
      });
      
      res.status(201).json({ redemption, reward });
    } catch (error) {
      res.status(500).json({ message: "Error redeeming reward" });
    }
  });
  
  app.get("/api/user/redemptions", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const redemptions = await storage.getUserRedemptions(user.id);
      res.json(redemptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user redemptions" });
    }
  });
  
  // Leaderboard route
  app.get("/api/leaderboard", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const leaderboard = await storage.getLeaderboard(user.company_id, limit);
      
      // Don't return passwords
      const sanitizedLeaderboard = leaderboard.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });
  
  // Stats route
  app.get("/api/user/stats", authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get commute logs
      const commuteLogs = await storage.getCommuteLogsByUserId(user.id);
      
      // Calculate total CO2 saved
      const totalCO2Saved = commuteLogs.reduce((total, log) => total + log.co2_saved_kg, 0);
      
      // Get user challenges
      const userChallenges = await storage.getUserChallenges(user.id);
      const completedChallenges = userChallenges.filter(uc => uc.participant.completed).length;
      
      // Response with stats
      res.json({
        points: user.points_total,
        streak: user.streak_count,
        co2_saved: totalCO2Saved,
        completed_challenges: completedChallenges
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  return httpServer;
}

// Helper function to calculate points for commutes
function calculateCommutePoints(commuteType: string, daysLogged: number): number {
  // Points awarded for different commute types
  const pointsPerDay: Record<string, number> = {
    walk: 30,
    cycle: 25,
    public_transport: 20,
    carpool: 15,
    electric_vehicle: 10,
    remote_work: 15,
    gas_vehicle: 0
  };
  
  // Base points
  let points = (pointsPerDay[commuteType] || 0) * daysLogged;
  
  // Bonus for consistency (3+ days of the same sustainable commute type)
  if (daysLogged >= 3 && commuteType !== "gas_vehicle") {
    points += 25;
  }
  
  return points;
}

// Helper function to update challenge progress when a commute is logged
async function updateChallengeProgressForCommute(userId: number, commuteData: any): Promise<void> {
  try {
    // Get all user's active challenges
    const userChallenges = await storage.getUserChallenges(userId);
    
    // For each challenge, check if this commute contributes to progress
    for (const { challenge, participant } of userChallenges) {
      // Skip completed challenges
      if (participant.completed) {
        continue;
      }
      
      let shouldUpdate = false;
      let newProgress = participant.progress;
      
      // Check if challenge is specific to commute type
      if (challenge.commute_type && challenge.commute_type === commuteData.commute_type) {
        // Commute type specific challenge
        if (challenge.goal_type === 'days') {
          // Add days logged to progress
          newProgress = Math.min(participant.progress + commuteData.days_logged, challenge.goal_value);
          shouldUpdate = true;
        } else if (challenge.goal_type === 'km') {
          // Add distance to progress
          newProgress = Math.min(participant.progress + commuteData.distance_km, challenge.goal_value);
          shouldUpdate = true;
        }
      } else if (!challenge.commute_type) {
        // General challenge for any sustainable commute
        if (challenge.goal_type === 'days') {
          // Add days logged to progress
          newProgress = Math.min(participant.progress + commuteData.days_logged, challenge.goal_value);
          shouldUpdate = true;
        }
      }
      
      // Update the challenge progress if needed
      if (shouldUpdate) {
        const completed = newProgress >= challenge.goal_value;
        await storage.updateChallengeProgress(participant.id, newProgress, completed);
        
        // If challenge is completed, award points
        if (completed && !participant.completed) {
          await storage.createPointsTransaction({
            user_id: userId,
            source: `Completed challenge: ${challenge.title}`,
            points: challenge.points_reward
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    // Don't throw, just log error so commute logging still succeeds
  }
}
