import * as schema from "@shared/schema";
import { 
  type User, type InsertUser,
  type Company, type InsertCompany,
  type CommuteLog, type InsertCommuteLog,
  type PointsTransaction, type InsertPointsTransaction,
  type Challenge, type InsertChallenge,
  type ChallengeParticipant, type InsertChallengeParticipant,
  type Reward, type InsertReward,
  type Redemption, type InsertRedemption,
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { and, asc, desc, eq, isNull, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User>;
  updateUserLocationSettings(userId: number, locationSettings: {
    home_address?: string;
    home_latitude?: string;
    home_longitude?: string;
    work_address?: string;
    work_latitude?: string;
    work_longitude?: string;
    commute_distance_km?: number;
  }): Promise<User>;
  updateUser(userId: number, updateData: {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    is_new_user?: boolean;
    needs_password_change?: boolean;
  }): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  // For Replit Auth integration
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByDomain(domain: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  
  // Commute operations
  createCommuteLog(commuteLog: InsertCommuteLog): Promise<CommuteLog>;
  getCommuteLog(id: number): Promise<CommuteLog | undefined>;
  getCommuteLogsByUserId(userId: number): Promise<CommuteLog[]>;
  getCommuteLogByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog | undefined>;
  getCommuteLogsByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog[]>;
  updateCommuteLog(id: number, commuteLog: Partial<InsertCommuteLog>): Promise<CommuteLog>;
  deleteCommuteLog(id: number): Promise<boolean>;
  
  // Points operations
  createPointsTransaction(transaction: InsertPointsTransaction): Promise<PointsTransaction>;
  getPointsTransactionsByUserId(userId: number): Promise<PointsTransaction[]>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenges(companyId?: number): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  updateChallenge(id: number, updateData: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;
  
  // Challenge participants
  joinChallenge(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]>;
  getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]>;
  updateChallengeProgress(id: number, progress: number, completed: boolean): Promise<ChallengeParticipant>;
  
  // Rewards
  createReward(reward: InsertReward): Promise<Reward>;
  getRewards(companyId?: number): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  
  // Redemptions
  redeemReward(redemption: InsertRedemption): Promise<Redemption>;
  getUserRedemptions(userId: number): Promise<{reward: Reward, redemption: Redemption}[]>;
  
  // Leaderboard
  getLeaderboard(companyId?: number, limit?: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private commuteLogs: Map<number, CommuteLog>;
  private pointsTransactions: Map<number, PointsTransaction>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant>;
  private rewards: Map<number, Reward>;
  private redemptions: Map<number, Redemption>;
  
  private currentUserId: number;
  private currentCompanyId: number;
  private currentCommuteLogId: number;
  private currentPointsTransactionId: number;
  private currentChallengeId: number;
  private currentChallengeParticipantId: number;
  private currentRewardId: number;
  private currentRedemptionId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.commuteLogs = new Map();
    this.pointsTransactions = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    this.rewards = new Map();
    this.redemptions = new Map();
    
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentCommuteLogId = 1;
    this.currentPointsTransactionId = 1;
    this.currentChallengeId = 1;
    this.currentChallengeParticipantId = 1;
    this.currentRewardId = 1;
    this.currentRedemptionId = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      points_total: 0, 
      streak_count: 0, 
      created_at: createdAt 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      points_total: user.points_total + points
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserLocationSettings(userId: number, locationSettings: {
    home_address?: string;
    home_latitude?: string;
    home_longitude?: string;
    work_address?: string;
    work_latitude?: string;
    work_longitude?: string;
    commute_distance_km?: number;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update location settings in the user object
    const updatedUser: User = {
      ...user,
      home_address: locationSettings.home_address !== undefined ? locationSettings.home_address : user.home_address,
      home_latitude: locationSettings.home_latitude !== undefined ? locationSettings.home_latitude : user.home_latitude,
      home_longitude: locationSettings.home_longitude !== undefined ? locationSettings.home_longitude : user.home_longitude,
      work_address: locationSettings.work_address !== undefined ? locationSettings.work_address : user.work_address,
      work_latitude: locationSettings.work_latitude !== undefined ? locationSettings.work_latitude : user.work_latitude,
      work_longitude: locationSettings.work_longitude !== undefined ? locationSettings.work_longitude : user.work_longitude,
      commute_distance_km: locationSettings.commute_distance_km !== undefined ? locationSettings.commute_distance_km : user.commute_distance_km,
    };
    
    // Update the user in the map
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  async updateUser(userId: number, updateData: {
    is_new_user?: boolean;
    needs_password_change?: boolean;
    password?: string;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user flags in the user object
    const updatedUser: User = {
      ...user,
      is_new_user: updateData.is_new_user !== undefined ? updateData.is_new_user : user.is_new_user,
      needs_password_change: updateData.needs_password_change !== undefined ? updateData.needs_password_change : user.needs_password_change,
      password: updateData.password !== undefined ? updateData.password : user.password
    };
    
    // Update the user in the map
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  // Replit Auth integration
  async upsertUser(userData: UpsertUser): Promise<User> {
    // Try to find the user by ID first
    const numericId = parseInt(userData.id);
    let existingUser = await this.getUser(numericId);
    
    // If not found by ID, try by email
    if (!existingUser && userData.email) {
      existingUser = Array.from(this.users.values()).find(user => 
        user.email === userData.email
      );
    }
    
    // Generate username and name from available data
    const username = userData.email 
      ? userData.email.split('@')[0] 
      : `user_${userData.id}`;
    
    const name = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName 
        ? userData.firstName
        : username;
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        email: userData.email,
        name: name
      };
      
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const id = numericId || this.currentUserId++;
      const newUser: User = {
        id,
        username,
        email: userData.email,
        name,
        password: "", // No password for OAuth users
        company_id: null,
        points_total: 0,
        streak_count: 0,
        role: "user",
        created_at: new Date(),
        home_address: null,
        home_latitude: null,
        home_longitude: null,
        work_address: null,
        work_latitude: null,
        work_longitude: null,
        commute_distance_km: null,
        is_new_user: true,
        needs_password_change: false
      };
      
      this.users.set(id, newUser);
      return newUser;
    }
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompanyByDomain(domain: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.domain === domain,
    );
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = { ...insertCompany, id };
    this.companies.set(id, company);
    return company;
  }
  
  async getUsersByCompany(companyId: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.company_id === companyId);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) {
      return false;
    }
    
    // Delete the user
    return this.users.delete(id);
  }
  
  // Commute operations
  async createCommuteLog(insertCommuteLog: InsertCommuteLog): Promise<CommuteLog> {
    const id = this.currentCommuteLogId++;
    const createdAt = new Date();
    
    // Calculate CO2 saved based on commute type and distance
    const co2SavedKg = this.calculateCO2Saved(
      insertCommuteLog.commute_type,
      insertCommuteLog.distance_km || 0,
      insertCommuteLog.days_logged
    );
    
    // Set day-specific fields, ensuring they are boolean values
    const monday = !!insertCommuteLog.monday;
    const tuesday = !!insertCommuteLog.tuesday;
    const wednesday = !!insertCommuteLog.wednesday;
    const thursday = !!insertCommuteLog.thursday;
    const friday = !!insertCommuteLog.friday;
    const saturday = !!insertCommuteLog.saturday;
    const sunday = !!insertCommuteLog.sunday;
    
    const commuteLog: CommuteLog = { 
      ...insertCommuteLog, 
      id, 
      co2_saved_kg: co2SavedKg,
      created_at: createdAt,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    };
    
    this.commuteLogs.set(id, commuteLog);
    return commuteLog;
  }

  async getCommuteLog(id: number): Promise<CommuteLog | undefined> {
    return this.commuteLogs.get(id);
  }
  
  async getCommuteLogsByUserId(userId: number): Promise<CommuteLog[]> {
    return Array.from(this.commuteLogs.values()).filter(
      (log) => log.user_id === userId,
    );
  }
  
  async getCommuteLogByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog | undefined> {
    return Array.from(this.commuteLogs.values()).find(
      (log) => log.user_id === userId && new Date(log.week_start).getTime() === weekStart.getTime(),
    );
  }
  
  async getCommuteLogsByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog[]> {
    return Array.from(this.commuteLogs.values()).filter(
      (log) => log.user_id === userId && new Date(log.week_start).getTime() === weekStart.getTime(),
    );
  }
  
  async deleteCommuteLog(id: number): Promise<boolean> {
    return this.commuteLogs.delete(id);
  }
  
  async updateCommuteLog(id: number, commuteLog: Partial<InsertCommuteLog>): Promise<CommuteLog> {
    const existingLog = this.commuteLogs.get(id);
    if (!existingLog) {
      throw new Error("Commute log not found");
    }
    
    // Handle day-specific fields
    const monday = commuteLog.monday !== undefined ? !!commuteLog.monday : existingLog.monday;
    const tuesday = commuteLog.tuesday !== undefined ? !!commuteLog.tuesday : existingLog.tuesday;
    const wednesday = commuteLog.wednesday !== undefined ? !!commuteLog.wednesday : existingLog.wednesday;
    const thursday = commuteLog.thursday !== undefined ? !!commuteLog.thursday : existingLog.thursday;
    const friday = commuteLog.friday !== undefined ? !!commuteLog.friday : existingLog.friday;
    const saturday = commuteLog.saturday !== undefined ? !!commuteLog.saturday : existingLog.saturday;
    const sunday = commuteLog.sunday !== undefined ? !!commuteLog.sunday : existingLog.sunday;
    
    const updatedLog: CommuteLog = {
      ...existingLog,
      ...commuteLog,
      co2_saved_kg: commuteLog.commute_type && commuteLog.distance_km && commuteLog.days_logged 
        ? this.calculateCO2Saved(
            commuteLog.commute_type, 
            commuteLog.distance_km,
            commuteLog.days_logged
          ) 
        : existingLog.co2_saved_kg,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    };
    
    this.commuteLogs.set(id, updatedLog);
    return updatedLog;
  }
  
  // Points operations
  async createPointsTransaction(insertTransaction: InsertPointsTransaction): Promise<PointsTransaction> {
    const id = this.currentPointsTransactionId++;
    const createdAt = new Date();
    const transaction: PointsTransaction = { ...insertTransaction, id, created_at: createdAt };
    
    this.pointsTransactions.set(id, transaction);
    
    // Update user's total points
    await this.updateUserPoints(insertTransaction.user_id, insertTransaction.points);
    
    return transaction;
  }
  
  async getPointsTransactionsByUserId(userId: number): Promise<PointsTransaction[]> {
    return Array.from(this.pointsTransactions.values()).filter(
      (transaction) => transaction.user_id === userId,
    );
  }
  
  // Challenge operations
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentChallengeId++;
    const createdAt = new Date();
    const challenge: Challenge = { ...insertChallenge, id, created_at: createdAt };
    
    this.challenges.set(id, challenge);
    return challenge;
  }
  
  async getChallenges(companyId?: number): Promise<Challenge[]> {
    if (companyId) {
      return Array.from(this.challenges.values()).filter(
        (challenge) => challenge.company_id === companyId || challenge.company_id === null,
      );
    }
    return Array.from(this.challenges.values());
  }
  
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async updateChallenge(id: number, updateData: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const existingChallenge = this.challenges.get(id);
    if (!existingChallenge) {
      return undefined;
    }
    
    const updatedChallenge: Challenge = {
      ...existingChallenge,
      ...updateData
    };
    
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }
  
  async deleteChallenge(id: number): Promise<boolean> {
    return this.challenges.delete(id);
  }
  
  // Challenge participants
  async joinChallenge(insertParticipant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const id = this.currentChallengeParticipantId++;
    const joinedAt = new Date();
    const participant: ChallengeParticipant = { 
      ...insertParticipant, 
      id, 
      joined_at: joinedAt 
    };
    
    this.challengeParticipants.set(id, participant);
    return participant;
  }
  
  async getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
    return Array.from(this.challengeParticipants.values()).filter(
      (participant) => participant.challenge_id === challengeId,
    );
  }
  
  async getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]> {
    const userParticipations = Array.from(this.challengeParticipants.values()).filter(
      (participant) => participant.user_id === userId,
    );
    
    return userParticipations.map(participant => {
      const challenge = this.challenges.get(participant.challenge_id);
      if (!challenge) {
        throw new Error(`Challenge ${participant.challenge_id} not found`);
      }
      return { challenge, participant };
    });
  }
  
  async updateChallengeProgress(id: number, progress: number, completed: boolean): Promise<ChallengeParticipant> {
    const participant = this.challengeParticipants.get(id);
    if (!participant) {
      throw new Error("Challenge participant not found");
    }
    
    const updatedParticipant: ChallengeParticipant = {
      ...participant,
      progress,
      completed
    };
    
    this.challengeParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }
  
  // Rewards
  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.currentRewardId++;
    const createdAt = new Date();
    const reward: Reward = { ...insertReward, id, created_at: createdAt };
    
    this.rewards.set(id, reward);
    return reward;
  }
  
  async getRewards(companyId?: number): Promise<Reward[]> {
    if (companyId) {
      return Array.from(this.rewards.values()).filter(
        (reward) => reward.company_id === companyId || reward.company_id === null,
      );
    }
    return Array.from(this.rewards.values());
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }
  
  // Redemptions
  async redeemReward(insertRedemption: InsertRedemption): Promise<Redemption> {
    const id = this.currentRedemptionId++;
    const redeemedAt = new Date();
    const redemption: Redemption = { ...insertRedemption, id, redeemed_at: redeemedAt };
    
    this.redemptions.set(id, redemption);
    
    // Deduct points from user
    const reward = await this.getReward(insertRedemption.reward_id);
    if (!reward) {
      throw new Error("Reward not found");
    }
    
    await this.updateUserPoints(insertRedemption.user_id, -reward.cost_points);
    
    return redemption;
  }
  
  async getUserRedemptions(userId: number): Promise<{reward: Reward, redemption: Redemption}[]> {
    const userRedemptions = Array.from(this.redemptions.values()).filter(
      (redemption) => redemption.user_id === userId,
    );
    
    return userRedemptions.map(redemption => {
      const reward = this.rewards.get(redemption.reward_id);
      if (!reward) {
        throw new Error(`Reward ${redemption.reward_id} not found`);
      }
      return { reward, redemption };
    });
  }
  
  // Leaderboard
  async getLeaderboard(companyId?: number, limit: number = 10): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (companyId) {
      users = users.filter(user => user.company_id === companyId);
    }
    
    return users.sort((a, b) => b.points_total - a.points_total).slice(0, limit);
  }
  
  // Helper methods
  private calculateCO2Saved(commuteType: string, distanceKm: number, daysLogged: number): number {
    // Average CO2 emissions in kg per km for different transport modes
    const emissionFactors: Record<string, number> = {
      walk: 0,
      cycle: 0,
      public_transport: 0.03,
      carpool: 0.07,
      electric_vehicle: 0.05,
      gas_vehicle: 0.19,
      remote_work: 0
    };
    
    // CO2 saved compared to average car (0.19 kg/km)
    const standardEmission = 0.19;
    const actualEmission = emissionFactors[commuteType] || 0;
    const saved = (standardEmission - actualEmission) * distanceKm * daysLogged;
    
    return Math.max(0, Math.round(saved)); // Ensure non-negative and round to integer
  }
  
  // Initialize with some sample data
  private initializeData(): void {
    // Create a company
    const company: Company = {
      id: 1,
      name: "Eco Corp",
      domain: "ecocorp.com"
    };
    this.companies.set(company.id, company);
    this.currentCompanyId++;
    
    // Create a user
    const now = new Date();
    const user: User = {
      id: 1,
      username: "alex.morgan",
      email: "alex@ecocorp.com",
      name: "Alex Morgan",
      password: "password123",
      company_id: company.id,
      points_total: 820,
      streak_count: 6,
      role: "user",
      created_at: now
    };
    this.users.set(user.id, user);
    this.currentUserId++;
    
    // Create some other leaderboard users
    const leaderboardUsers = [
      {
        id: 2,
        username: "daniel",
        email: "daniel@ecocorp.com",
        name: "Daniel",
        password: "password123",
        company_id: company.id,
        points_total: 1250,
        streak_count: 8,
        role: "user",
        created_at: now
      },
      {
        id: 3,
        username: "emma",
        email: "emma@ecocorp.com",
        name: "Emma",
        password: "password123",
        company_id: company.id,
        points_total: 980,
        streak_count: 5,
        role: "user",
        created_at: now
      },
      {
        id: 4,
        username: "robert",
        email: "robert@ecocorp.com",
        name: "Robert",
        password: "password123",
        company_id: company.id,
        points_total: 855,
        streak_count: 4,
        role: "user",
        created_at: now
      },
      {
        id: 5,
        username: "sarah.johnson",
        email: "sarah@ecocorp.com",
        name: "Sarah Johnson",
        password: "password123",
        company_id: company.id,
        points_total: 840,
        streak_count: 3,
        role: "user",
        created_at: now
      },
      {
        id: 6,
        username: "mark.thompson",
        email: "mark@ecocorp.com",
        name: "Mark Thompson",
        password: "password123",
        company_id: company.id,
        points_total: 785,
        streak_count: 2,
        role: "user",
        created_at: now
      }
    ];
    
    for (const leaderboardUser of leaderboardUsers) {
      this.users.set(leaderboardUser.id, leaderboardUser);
      this.currentUserId++;
    }
    
    // Create commute logs for the user
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const commuteLogs = [
      {
        id: 1,
        user_id: user.id,
        week_start: weekStart,
        commute_type: "cycle",
        days_logged: 3,
        distance_km: 8,
        co2_saved_kg: 5,
        created_at: now
      },
      {
        id: 2,
        user_id: user.id,
        week_start: weekStart,
        commute_type: "public_transport",
        days_logged: 1,
        distance_km: 12,
        co2_saved_kg: 2,
        created_at: now
      },
      {
        id: 3,
        user_id: user.id,
        week_start: weekStart,
        commute_type: "remote_work",
        days_logged: 1,
        distance_km: 0,
        co2_saved_kg: 3,
        created_at: now
      }
    ];
    
    for (const log of commuteLogs) {
      this.commuteLogs.set(log.id, log);
      this.currentCommuteLogId++;
    }
    
    // Create challenges
    const challenges = [
      {
        id: 1,
        title: "Bike to Work Week",
        description: "Cycle at least 3 days this week",
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
        points_reward: 50,
        goal_type: "days",
        goal_value: 3,
        commute_type: "cycle",
        company_id: company.id,
        created_at: now
      },
      {
        id: 2,
        title: "Green Commute Month",
        description: "Use sustainable transportation 15 days this month",
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
        points_reward: 100,
        goal_type: "days",
        goal_value: 15,
        commute_type: null,
        company_id: company.id,
        created_at: now
      }
    ];
    
    for (const challenge of challenges) {
      this.challenges.set(challenge.id, challenge);
      this.currentChallengeId++;
    }
    
    // Add user as participant in challenges
    const participants = [
      {
        id: 1,
        challenge_id: 1,
        user_id: user.id,
        progress: 3,
        completed: true,
        joined_at: now
      },
      {
        id: 2,
        challenge_id: 2,
        user_id: user.id,
        progress: 11,
        completed: false,
        joined_at: now
      }
    ];
    
    for (const participant of participants) {
      this.challengeParticipants.set(participant.id, participant);
      this.currentChallengeParticipantId++;
    }
    
    // Create rewards
    const rewards = [
      {
        id: 1,
        title: "Free Coffee Voucher",
        description: "Redeem a free coffee at the office café",
        cost_points: 200,
        quantity_limit: 50,
        company_id: company.id,
        created_at: now
      },
      {
        id: 2,
        title: "Free Lunch Voucher",
        description: "Enjoy a free lunch at any of our partner restaurants",
        cost_points: 500,
        quantity_limit: 20,
        company_id: company.id,
        created_at: now
      },
      {
        id: 3,
        title: "Half-Day Off",
        description: "Take a half-day off, on us!",
        cost_points: 1000,
        quantity_limit: 10,
        company_id: company.id,
        created_at: now
      }
    ];
    
    for (const reward of rewards) {
      this.rewards.set(reward.id, reward);
      this.currentRewardId++;
    }
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values({
        ...insertUser,
        points_total: 0,
        streak_count: 0
      })
      .returning();
    return user;
  }
  
  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const [updatedUser] = await db
      .update(schema.users)
      .set({ points_total: user.points_total + points })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserLocationSettings(userId: number, locationSettings: {
    home_address?: string;
    home_latitude?: string;
    home_longitude?: string;
    work_address?: string;
    work_latitude?: string;
    work_longitude?: string;
    commute_distance_km?: number;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create update data with only fields that are provided
    const updateData: any = {};
    
    if (locationSettings.home_address !== undefined) {
      updateData.home_address = locationSettings.home_address;
    }
    
    if (locationSettings.home_latitude !== undefined) {
      updateData.home_latitude = locationSettings.home_latitude;
    }
    
    if (locationSettings.home_longitude !== undefined) {
      updateData.home_longitude = locationSettings.home_longitude;
    }
    
    if (locationSettings.work_address !== undefined) {
      updateData.work_address = locationSettings.work_address;
    }
    
    if (locationSettings.work_latitude !== undefined) {
      updateData.work_latitude = locationSettings.work_latitude;
    }
    
    if (locationSettings.work_longitude !== undefined) {
      updateData.work_longitude = locationSettings.work_longitude;
    }
    
    if (locationSettings.commute_distance_km !== undefined) {
      updateData.commute_distance_km = locationSettings.commute_distance_km;
    }
    
    const [updatedUser] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUser(userId: number, updateData: {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    is_new_user?: boolean;
    needs_password_change?: boolean;
  }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create update data with only fields that are provided
    const userData: any = {};
    
    if (updateData.name !== undefined) {
      userData.name = updateData.name;
    }
    
    if (updateData.email !== undefined) {
      userData.email = updateData.email;
    }
    
    if (updateData.username !== undefined) {
      userData.username = updateData.username;
    }
    
    if (updateData.password !== undefined) {
      userData.password = updateData.password;
    }
    
    if (updateData.role !== undefined) {
      userData.role = updateData.role;
    }
    
    if (updateData.is_new_user !== undefined) {
      userData.is_new_user = updateData.is_new_user;
    }
    
    if (updateData.needs_password_change !== undefined) {
      userData.needs_password_change = updateData.needs_password_change;
    }
    
    const [updatedUser] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(schema.users)
        .where(eq(schema.users.id, id));
      
      // Return true if at least one row was affected
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  // Replit Auth integration
  async upsertUser(userData: UpsertUser): Promise<User> {
    // First try to find the user by ID (Replit sub as string)
    let existingUser: User | undefined;
    
    try {
      const numericId = parseInt(userData.id);
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, numericId));
      existingUser = user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
    }
    
    // If no user found by ID, try by email
    if (!existingUser && userData.email) {
      try {
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, userData.email));
        existingUser = user;
      } catch (error) {
        console.error("Error finding user by email:", error);
      }
    }
    
    // Generate username and name from available data
    const username = userData.email 
      ? userData.email.split('@')[0] 
      : `user_${userData.id}`;
    
    const name = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName 
        ? userData.firstName
        : username;
    
    if (existingUser) {
      // Update existing user
      const updateData: any = {
        email: userData.email,
        name: name
      };
      
      const [updatedUser] = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, existingUser.id))
        .returning();
      
      return updatedUser;
    } else {
      // Create new user with minimal data
      const insertData = {
        id: parseInt(userData.id),
        username: username,
        email: userData.email,
        name: name,
        password: "", // No password for OAuth users
        points_total: 0,
        streak_count: 0,
        role: "user",
        is_new_user: true
      };
      
      const [newUser] = await db
        .insert(schema.users)
        .values(insertData)
        .returning();
      
      return newUser;
    }
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company || undefined;
  }
  
  async getCompanyByDomain(domain: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.domain, domain));
    return company || undefined;
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(schema.companies)
      .values(insertCompany)
      .returning();
    return company;
  }
  
  async getUsersByCompany(companyId: number): Promise<User[]> {
    return db.select()
      .from(schema.users)
      .where(eq(schema.users.company_id, companyId));
  }
  
  // Commute operations
  async createCommuteLog(insertCommuteLog: InsertCommuteLog): Promise<CommuteLog> {
    // Calculate CO2 saved based on commute type and distance
    const co2SavedKg = this.calculateCO2Saved(
      insertCommuteLog.commute_type,
      insertCommuteLog.distance_km || 0,
      insertCommuteLog.days_logged
    );
    
    const [commuteLog] = await db
      .insert(schema.commuteLogs)
      .values({
        ...insertCommuteLog,
        co2_saved_kg: co2SavedKg
      })
      .returning();
    
    return commuteLog;
  }
  
  async getCommuteLog(id: number): Promise<CommuteLog | undefined> {
    const [log] = await db
      .select()
      .from(schema.commuteLogs)
      .where(eq(schema.commuteLogs.id, id));
    
    return log || undefined;
  }
  
  async getCommuteLogsByUserId(userId: number): Promise<CommuteLog[]> {
    return db.select().from(schema.commuteLogs).where(eq(schema.commuteLogs.user_id, userId));
  }
  
  async getCommuteLogByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog | undefined> {
    const weekStartStr = weekStart.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    const [log] = await db
      .select()
      .from(schema.commuteLogs)
      .where(
        and(
          eq(schema.commuteLogs.user_id, userId),
          eq(schema.commuteLogs.week_start, weekStartStr)
        )
      );
    return log || undefined;
  }
  
  async getCommuteLogsByUserIdAndWeek(userId: number, weekStart: Date): Promise<CommuteLog[]> {
    const weekStartStr = weekStart.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    return db
      .select()
      .from(schema.commuteLogs)
      .where(
        and(
          eq(schema.commuteLogs.user_id, userId),
          eq(schema.commuteLogs.week_start, weekStartStr)
        )
      );
  }
  
  async deleteCommuteLog(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.commuteLogs)
      .where(eq(schema.commuteLogs.id, id));
    
    return !!result;
  }
  
  async updateCommuteLog(id: number, commuteLog: Partial<InsertCommuteLog>): Promise<CommuteLog> {
    const existingLog = await db
      .select()
      .from(schema.commuteLogs)
      .where(eq(schema.commuteLogs.id, id))
      .then(logs => logs[0]);
    
    if (!existingLog) {
      throw new Error("Commute log not found");
    }
    
    let co2_saved_kg = existingLog.co2_saved_kg;
    if (commuteLog.commute_type && commuteLog.distance_km && commuteLog.days_logged) {
      co2_saved_kg = this.calculateCO2Saved(
        commuteLog.commute_type,
        commuteLog.distance_km,
        commuteLog.days_logged
      );
    }
    
    const [updatedLog] = await db
      .update(schema.commuteLogs)
      .set({
        ...commuteLog,
        co2_saved_kg
      })
      .where(eq(schema.commuteLogs.id, id))
      .returning();
    
    return updatedLog;
  }
  
  // Points operations
  async createPointsTransaction(insertTransaction: InsertPointsTransaction): Promise<PointsTransaction> {
    const [transaction] = await db
      .insert(schema.pointsTransactions)
      .values(insertTransaction)
      .returning();
    
    // Update user's total points
    await this.updateUserPoints(insertTransaction.user_id, insertTransaction.points);
    
    return transaction;
  }
  
  async getPointsTransactionsByUserId(userId: number): Promise<PointsTransaction[]> {
    return db
      .select()
      .from(schema.pointsTransactions)
      .where(eq(schema.pointsTransactions.user_id, userId));
  }
  
  // Challenge operations
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db
      .insert(schema.challenges)
      .values(insertChallenge)
      .returning();
    
    return challenge;
  }
  
  async getChallenges(companyId?: number): Promise<Challenge[]> {
    console.log("Getting challenges for company ID:", companyId);
    
    if (companyId) {
      const challengesData = await db
        .select()
        .from(schema.challenges)
        .where(
          or(
            eq(schema.challenges.company_id, companyId),
            isNull(schema.challenges.company_id)
          )
        );
      
      console.log(`Found ${challengesData.length} challenges for company ${companyId}`);
      return challengesData;
    }
    
    const challengesData = await db.select().from(schema.challenges);
    console.log(`Found ${challengesData.length} challenges across all companies`);
    return challengesData;
  }
  
  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(schema.challenges)
      .where(eq(schema.challenges.id, id));
    
    return challenge || undefined;
  }
  
  async updateChallenge(id: number, updateData: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const [updatedChallenge] = await db
      .update(schema.challenges)
      .set(updateData)
      .where(eq(schema.challenges.id, id))
      .returning();
    
    return updatedChallenge;
  }
  
  async deleteChallenge(id: number): Promise<boolean> {
    try {
      await db
        .delete(schema.challenges)
        .where(eq(schema.challenges.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting challenge:", error);
      return false;
    }
  }
  
  // Challenge participants
  async joinChallenge(insertParticipant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const [participant] = await db
      .insert(schema.challengeParticipants)
      .values(insertParticipant)
      .returning();
    
    return participant;
  }
  
  async getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
    return db
      .select()
      .from(schema.challengeParticipants)
      .where(eq(schema.challengeParticipants.challenge_id, challengeId));
  }
  
  async getUserChallenges(userId: number): Promise<{challenge: Challenge, participant: ChallengeParticipant}[]> {
    const userParticipations = await db
      .select()
      .from(schema.challengeParticipants)
      .where(eq(schema.challengeParticipants.user_id, userId));
    
    const results: {challenge: Challenge, participant: ChallengeParticipant}[] = [];
    
    for (const participant of userParticipations) {
      const challenge = await this.getChallenge(participant.challenge_id);
      if (!challenge) {
        throw new Error(`Challenge ${participant.challenge_id} not found`);
      }
      results.push({ challenge, participant });
    }
    
    return results;
  }
  
  async updateChallengeProgress(id: number, progress: number, completed: boolean): Promise<ChallengeParticipant> {
    const [updatedParticipant] = await db
      .update(schema.challengeParticipants)
      .set({ progress, completed })
      .where(eq(schema.challengeParticipants.id, id))
      .returning();
    
    if (!updatedParticipant) {
      throw new Error("Challenge participant not found");
    }
    
    return updatedParticipant;
  }
  
  // Rewards
  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(schema.rewards)
      .values(insertReward)
      .returning();
    
    return reward;
  }
  
  async getRewards(companyId?: number): Promise<Reward[]> {
    console.log("Getting rewards for company ID:", companyId);
    
    if (companyId) {
      const result = await db
        .select()
        .from(schema.rewards)
        .where(
          or(
            eq(schema.rewards.company_id, companyId),
            isNull(schema.rewards.company_id)
          )
        );
      
      console.log(`Found ${result.length} rewards for company ${companyId}`);
      return result;
    }
    
    const result = await db.select().from(schema.rewards);
    console.log(`Found ${result.length} rewards across all companies`);
    return result;
  }
  
  async getReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db
      .select()
      .from(schema.rewards)
      .where(eq(schema.rewards.id, id));
    
    return reward || undefined;
  }
  
  // Redemptions
  async redeemReward(insertRedemption: InsertRedemption): Promise<Redemption> {
    const [redemption] = await db
      .insert(schema.redemptions)
      .values(insertRedemption)
      .returning();
    
    // Deduct points from user
    const reward = await this.getReward(insertRedemption.reward_id);
    if (!reward) {
      throw new Error("Reward not found");
    }
    
    await this.updateUserPoints(insertRedemption.user_id, -reward.cost_points);
    
    return redemption;
  }
  
  async getUserRedemptions(userId: number): Promise<{reward: Reward, redemption: Redemption}[]> {
    const userRedemptions = await db
      .select()
      .from(schema.redemptions)
      .where(eq(schema.redemptions.user_id, userId));
    
    const results: {reward: Reward, redemption: Redemption}[] = [];
    
    for (const redemption of userRedemptions) {
      const reward = await this.getReward(redemption.reward_id);
      if (!reward) {
        throw new Error(`Reward ${redemption.reward_id} not found`);
      }
      results.push({ reward, redemption });
    }
    
    return results;
  }
  
  // Leaderboard
  async getLeaderboard(companyId?: number, limit: number = 10): Promise<User[]> {
    console.log("Getting leaderboard for company ID:", companyId);
    
    if (companyId) {
      const result = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.company_id, companyId))
        .orderBy(desc(schema.users.points_total))
        .limit(limit);
      
      console.log(`Found ${result.length} users for company ${companyId}`);
      return result;
    }
    
    const result = await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.points_total))
      .limit(limit);
    
    console.log(`Found ${result.length} users across all companies`);
    return result;
  }
  
  // Helper methods
  private calculateCO2Saved(commuteType: string, distanceKm: number, daysLogged: number): number {
    // Average CO2 emissions in kg per km for different transport modes
    const emissionFactors: Record<string, number> = {
      walk: 0,
      cycle: 0,
      public_transport: 0.03,
      carpool: 0.07,
      electric_vehicle: 0.05,
      gas_vehicle: 0.19,
      remote_work: 0
    };
    
    // CO2 saved compared to average car (0.19 kg/km)
    const standardEmission = 0.19;
    const actualEmission = emissionFactors[commuteType] || 0;
    const saved = (standardEmission - actualEmission) * distanceKm * daysLogged;
    
    return Math.max(0, Math.round(saved)); // Ensure non-negative and round to integer
  }
}

// Use the database storage instead of in-memory
export const storage = new DatabaseStorage();
