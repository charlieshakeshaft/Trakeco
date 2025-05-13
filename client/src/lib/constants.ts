import { CommuteType } from './types';

export const commuteTypeOptions = [
  { value: 'walk', label: 'Walking', icon: 'directions_walk' },
  { value: 'cycle', label: 'Cycling', icon: 'directions_bike' },
  { value: 'public_transport', label: 'Public Transport', icon: 'train' },
  { value: 'carpool', label: 'Carpooling', icon: 'people' },
  { value: 'electric_vehicle', label: 'Electric Vehicle', icon: 'electric_car' },
  { value: 'remote_work', label: 'Remote Work', icon: 'home' },
  { value: 'gas_vehicle', label: 'Gas/Diesel Vehicle', icon: 'directions_car' },
];

interface CommuteTypeInfo {
  label: string;
  icon: string;
  backgroundColor: string;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
  description: string;
  pointsPerDay: number;
}

export const commuteTypeConfig: Record<CommuteType, CommuteTypeInfo> = {
  walk: {
    label: 'Walking',
    icon: 'directions_walk',
    backgroundColor: 'green-50',
    borderColor: 'green-100',
    iconBgColor: 'primary/10',
    iconColor: 'primary',
    description: 'Zero emissions and great for health. Earn 30 points per day.',
    pointsPerDay: 30
  },
  cycle: {
    label: 'Cycling',
    icon: 'directions_bike',
    backgroundColor: 'green-50',
    borderColor: 'green-100',
    iconBgColor: 'primary/10',
    iconColor: 'primary',
    description: 'Zero emissions and excellent exercise. Earn 25 points per day.',
    pointsPerDay: 25
  },
  public_transport: {
    label: 'Public Transport',
    icon: 'train',
    backgroundColor: 'blue-50',
    borderColor: 'blue-100',
    iconBgColor: 'secondary/10',
    iconColor: 'secondary',
    description: 'Low emissions per passenger. Earn 20 points per day.',
    pointsPerDay: 20
  },
  carpool: {
    label: 'Carpooling',
    icon: 'people',
    backgroundColor: 'blue-50',
    borderColor: 'blue-100',
    iconBgColor: 'secondary/10',
    iconColor: 'secondary',
    description: 'Reduced emissions by sharing rides. Earn 15 points per day.',
    pointsPerDay: 15
  },
  electric_vehicle: {
    label: 'Electric Vehicle',
    icon: 'electric_car',
    backgroundColor: 'blue-50',
    borderColor: 'blue-100',
    iconBgColor: 'secondary/10',
    iconColor: 'secondary',
    description: 'Lower emissions than gas vehicles. Earn 10 points per day.',
    pointsPerDay: 10
  },
  remote_work: {
    label: 'Remote Work',
    icon: 'home',
    backgroundColor: 'amber-50',
    borderColor: 'amber-100',
    iconBgColor: 'accent/10',
    iconColor: 'accent-dark',
    description: 'Zero commute emissions. Earn 15 points per day.',
    pointsPerDay: 15
  },
  gas_vehicle: {
    label: 'Gas/Diesel Vehicle',
    icon: 'directions_car',
    backgroundColor: 'gray-50',
    borderColor: 'gray-100',
    iconBgColor: 'gray-500/10',
    iconColor: 'gray-500',
    description: 'Standard emissions baseline. No points earned.',
    pointsPerDay: 0
  }
};

export const DEMO_USER_ID = 1;

export const rewardIcons: Record<string, string> = {
  coffee: 'coffee',
  cafe: 'coffee',
  lunch: 'lunch_dining',
  food: 'lunch_dining',
  meal: 'lunch_dining',
  'day off': 'access_time',
  'half-day': 'access_time',
  time: 'access_time',
  gift: 'card_giftcard',
  card: 'card_giftcard',
  voucher: 'local_activity',
  discount: 'attach_money',
  ticket: 'local_activity',
  pass: 'local_activity'
};

export function getRewardIcon(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  for (const [keyword, icon] of Object.entries(rewardIcons)) {
    if (lowerTitle.includes(keyword)) {
      return icon;
    }
  }
  
  return 'card_giftcard';
}
