import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CommuteLog, CommuteType } from "@/lib/types";
import { startOfWeek } from "date-fns";
import { useToast } from "./use-toast";

interface LogCommuteData {
  commute_type: CommuteType;
  days_logged: number;
  distance_km: number;
}

export function useCommuteLogs(userId: number) {
  return useQuery({
    queryKey: [`/api/commutes?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useCurrentWeekCommuteLogs(userId: number) {
  return useQuery<CommuteLog[]>({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useLogCommute(userId: number, onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LogCommuteData) => {
      // Get the start of the current week (Sunday)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      
      return await apiRequest("POST", `/api/commutes?userId=${userId}`, {
        ...data,
        week_start: weekStart.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Commute logged successfully!",
        description: "Your sustainable commute has been recorded.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/commutes/current?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/challenges?userId=${userId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log commute",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Calculate CO2 saved based on commute type and distance
export function calculateCO2Saved(commuteType: CommuteType, distanceKm: number, daysLogged: number): number {
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
