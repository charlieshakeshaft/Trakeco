import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commuteTypeOptions } from "@/lib/constants";
import { startOfWeek, subWeeks, format } from "date-fns";
import { Link } from "wouter";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WeeklyCommuteFormProps {
  userId: number;
  onSuccess?: () => void;
}

// Simplified schema for week-based commute logging
const commuteSchema = z.object({
  // Week selection
  week_selection: z.enum(["current", "previous"]),
  
  // Basic commute information
  commute_type: z.string().min(1, "Please select a commute method"),
  
  // Days selection
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
}).refine((data) => {
  // Ensure at least one day is selected
  return [
    data.monday, data.tuesday, data.wednesday, data.thursday, 
    data.friday, data.saturday, data.sunday
  ].some(Boolean);
}, {
  message: "Please select at least one day",
  path: ["monday"],
});

type CommuteFormValues = z.infer<typeof commuteSchema>;

// Day of week helper
const DAYS_OF_WEEK = [
  { id: "monday", name: "Monday", short: "Mon" },
  { id: "tuesday", name: "Tuesday", short: "Tue" },
  { id: "wednesday", name: "Wednesday", short: "Wed" },
  { id: "thursday", name: "Thursday", short: "Thu" },
  { id: "friday", name: "Friday", short: "Fri" },
  { id: "saturday", name: "Saturday", short: "Sat" },
  { id: "sunday", name: "Sunday", short: "Sun" }
];

const WeeklyCommuteFormSimple = ({ userId, onSuccess }: WeeklyCommuteFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user profile to get commute distance and location settings
  const { data: user } = useQuery({
    queryKey: [`/api/user/profile?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  // Helper to check if home/work locations are set
  const hasHomeAddress = user && typeof user === 'object' && 'home_address' in user && !!user.home_address;
  const hasWorkAddress = user && typeof user === 'object' && 'work_address' in user && !!user.work_address;
  const locationConfigured = hasHomeAddress && hasWorkAddress;
  
  // Default distance if not set
  const commuteDistance = user && typeof user === 'object' && 'commute_distance_km' in user ? 
    (user.commute_distance_km || 5) : 5;

  const form = useForm<CommuteFormValues>({
    resolver: zodResolver(commuteSchema),
    defaultValues: {
      week_selection: "current",
      commute_type: "",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });

  const commuteLogMutation = useMutation({
    mutationFn: async (data: CommuteFormValues) => {
      // Calculate days logged
      const daysLogged = [
        data.monday, data.tuesday, data.wednesday, data.thursday,
        data.friday, data.saturday, data.sunday
      ].filter(Boolean).length;
      
      // Get the selected week's start date
      const now = new Date();
      const weekStartDate = data.week_selection === "current"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      
      return await apiRequest(`/api/commutes/log?userId=${userId}`, {
        commute_type: data.commute_type,
        days_logged: daysLogged,
        distance_km: commuteDistance,
        week_start: format(weekStartDate, 'yyyy-MM-dd'),
        
        // Day selections
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
      }, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Commute logged successfully!",
        description: "Your sustainable commute has been recorded.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/commutes/current?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats?userId=${userId}`] });
      
      // Reset form
      form.reset();
      
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
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: CommuteFormValues) => {
    setIsSubmitting(true);
    commuteLogMutation.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="material-icons mr-2">directions_car</span>
          Log Your Commute
        </CardTitle>
        <CardDescription>Track your sustainable commuting habits for the week</CardDescription>
      </CardHeader>
      <CardContent>
        {!locationConfigured && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <span className="material-icons text-amber-500">location_off</span>
              </div>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">For accurate distance tracking, please set your home and work locations first.</p>
                <Link href="/profile?tab=settings">
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    <span className="material-icons mr-1 text-sm">settings</span>
                    Set Locations
                  </Button>
                </Link>
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Week Selection */}
            <FormField
              control={form.control}
              name="week_selection"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Which week are you logging for?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="current" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Current Week ({format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')})
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="previous" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Previous Week ({format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'MMM d')} - {format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'MMM d')})
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    You can only log commutes for the current or previous week.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            {/* Commute Method */}
            <FormField
              control={form.control}
              name="commute_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you commute?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your commute method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commuteTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span className="material-icons mr-2 text-gray-500">{option.icon}</span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Day Selection */}
            <div className="space-y-3">
              <FormLabel>Which days did you use this method?</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <FormField
                    key={day.id}
                    control={form.control}
                    name={day.id as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">{day.name}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormDescription>
                Select all days you used this commute method for travel to or from work.
              </FormDescription>
              {form.formState.errors.monday && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.monday.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !locationConfigured}
            >
              {isSubmitting ? (
                <>
                  <span className="material-icons animate-spin mr-2">autorenew</span>
                  Saving commute data...
                </>
              ) : !locationConfigured ? (
                <>
                  <span className="material-icons mr-2">location_off</span>
                  Set Location Details First
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">save</span>
                  Save Commute
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WeeklyCommuteFormSimple;