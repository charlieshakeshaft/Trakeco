export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  company_id?: number;
  points_total: number;
  streak_count: number;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Company {
  id: number;
  name: string;
  domain?: string;
}

export type CommuteType = 'walk' | 'cycle' | 'public_transport' | 'carpool' | 'electric_vehicle' | 'gas_vehicle' | 'remote_work';

export interface CommuteLog {
  id: number;
  user_id: number;
  week_start: string;
  commute_type: CommuteType;
  days_logged: number;
  distance_km: number;
  co2_saved_kg: number;
  created_at: string;
}

export interface PointsTransaction {
  id: number;
  user_id: number;
  source: string;
  points: number;
  created_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  points_reward: number;
  goal_type: string;
  goal_value: number;
  commute_type: CommuteType | null;
  company_id: number | null;
  created_at: string;
}

export interface ChallengeParticipant {
  id: number;
  challenge_id: number;
  user_id: number;
  progress: number;
  completed: boolean;
  joined_at: string;
}

export interface UserChallenge {
  challenge: Challenge;
  participant: ChallengeParticipant;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  cost_points: number;
  quantity_limit: number | null;
  company_id: number | null;
  created_at: string;
}

export interface Redemption {
  id: number;
  user_id: number;
  reward_id: number;
  redeemed_at: string;
}

export interface UserRedemption {
  reward: Reward;
  redemption: Redemption;
}

export interface UserStats {
  points: number;
  streak: number;
  co2_saved: number;
  completed_challenges: number;
}

export interface LeaderboardUser {
  id: number;
  name: string;
  email: string;
  points_total: number;
  streak_count: number;
  profileImageUrl?: string;
}
