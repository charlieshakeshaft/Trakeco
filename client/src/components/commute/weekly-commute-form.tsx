import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commuteTypeOptions } from "@/lib/constants";
import { startOfWeek, subWeeks, format, addDays } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

interface WeeklyCommuteFormProps {
  userId: number;
  onSuccess?: () => void;
}

// Enhanced schema for week-based commute logging
const commuteSchema = z.object({
  // Week selection
  week_selection: z.enum(["current", "previous"]),
  
  // Basic fields for backward compatibility
  commute_type: z.string().min(1, "Please select a default commute type"),
  
  // Day selection booleans
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
  
  // New fields for logging different commute methods for going to work and returning home
  monday_to_work: z.string().optional(),
  monday_to_home: z.string().optional(),
  tuesday_to_work: z.string().optional(),
  tuesday_to_home: z.string().optional(),
  wednesday_to_work: z.string().optional(),
  wednesday_to_home: z.string().optional(),
  thursday_to_work: z.string().optional(),
  thursday_to_home: z.string().optional(),
  friday_to_work: z.string().optional(),
  friday_to_home: z.string().optional(),
  saturday_to_work: z.string().optional(),
  saturday_to_home: z.string().optional(),
  sunday_to_work: z.string().optional(),
  sunday_to_home: z.string().optional(),
}).refine((data) => {
  // Ensure at least one day has at least one direction (to work OR to home) selected
  const hasToWork = [
    data.monday_to_work, data.tuesday_to_work, data.wednesday_to_work, 
    data.thursday_to_work, data.friday_to_work, data.saturday_to_work, data.sunday_to_work
  ].some(val => !!val);
  
  const hasToHome = [
    data.monday_to_home, data.tuesday_to_home, data.wednesday_to_home, 
    data.thursday_to_home, data.friday_to_home, data.saturday_to_home, data.sunday_to_home
  ].some(val => !!val);
  
  return hasToWork || hasToHome;
}, {
  message: "Please select at least one commute direction for any day",
  path: ["commute_type"],
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

const WeeklyCommuteForm = ({ userId, onSuccess }: WeeklyCommuteFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  // Fetch user profile to get commute distance and location settings
  const { data: user } = useQuery({
    queryKey: [`/api/user/profile?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  // Fetch existing commute data
  const { data: currentCommutes } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  // Default distance if not set
  const commuteDistance = user && 'commute_distance_km' in user ? user.commute_distance_km : 5;

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
      monday_to_work: "",
      monday_to_home: "",
      tuesday_to_work: "",
      tuesday_to_home: "",
      wednesday_to_work: "",
      wednesday_to_home: "",
      thursday_to_work: "",
      thursday_to_home: "",
      friday_to_work: "",
      friday_to_home: "",
      saturday_to_work: "",
      saturday_to_home: "",
      sunday_to_work: "",
      sunday_to_home: "",
    },
  });

  // Update week dates when week selection changes
  useEffect(() => {
    const now = new Date();
    let weekStartDate: Date;
    
    const weekSelection = form.getValues().week_selection;
    if (weekSelection === "current") {
      weekStartDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday as week start
    } else {
      weekStartDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // Last week
    }
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStartDate, i));
    }
    
    setWeekDates(dates);
    
    // Find any existing commute data and pre-populate the form
    if (currentCommutes && currentCommutes.length > 0) {
      const commute = currentCommutes[0];
      
      // Check if this commute record is for the selected week
      const commuteWeekStart = new Date(commute.week_start);
      const selectedWeekStart = weekSelection === "current" 
        ? startOfWeek(now, { weekStartsOn: 1 }) 
        : startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      
      if (format(commuteWeekStart, 'yyyy-MM-dd') === format(selectedWeekStart, 'yyyy-MM-dd')) {
        // Pre-populate the form with existing commute data
        form.setValue("commute_type", commute.commute_type || "");
        
        // Check each day and set values
        DAYS_OF_WEEK.forEach(day => {
          const dayField = day.id as keyof typeof commute;
          if (commute[dayField]) {
            form.setValue(dayField, true);
          }
          
          // Set the to/from commute types if they exist
          const toWorkField = `${day.id}_to_work` as keyof typeof commute;
          const toHomeField = `${day.id}_to_home` as keyof typeof commute;
          
          if (commute[toWorkField]) {
            form.setValue(toWorkField as any, commute[toWorkField] as string);
          }
          
          if (commute[toHomeField]) {
            form.setValue(toHomeField as any, commute[toHomeField] as string);
          }
        });
      }
    }
  }, [form.watch("week_selection"), currentCommutes]);

  // Calculate the number of days logged across all selected days
  const calculateDaysLogged = (data: CommuteFormValues): number => {
    // Count days that have at least one direction (to work OR to home) selected
    return DAYS_OF_WEEK.filter(day => {
      const toWorkValue = data[`${day.id}_to_work` as keyof typeof data];
      const toHomeValue = data[`${day.id}_to_home` as keyof typeof data];
      return !!toWorkValue || !!toHomeValue;
    }).length;
  };

  // Helper function to set commute type for a specific day and direction
  const setDayCommute = (day: string, direction: 'to_work' | 'to_home', value: string) => {
    const fieldName = `${day}_${direction}` as const;
    form.setValue(fieldName as any, value);
  };

  // When a day is selected/deselected, update the checkbox state
  const updateDaySelection = (day: string) => {
    const toWork = form.getValues(`${day}_to_work` as any);
    const toHome = form.getValues(`${day}_to_home` as any);
    form.setValue(day as any, !!(toWork || toHome));
  };

  // Apply default commute type to all selected days
  const applyDefaultToAll = (value: string) => {
    DAYS_OF_WEEK.forEach(day => {
      if (form.getValues(day.id as any)) {
        if (!form.getValues(`${day.id}_to_work` as any)) {
          form.setValue(`${day.id}_to_work` as any, value);
        }
        if (!form.getValues(`${day.id}_to_home` as any)) {
          form.setValue(`${day.id}_to_home` as any, value);
        }
      }
    });
  };

  const commuteLogMutation = useMutation({
    mutationFn: async (data: CommuteFormValues) => {
      // Calculate days logged
      const daysLogged = calculateDaysLogged(data);
      
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
        
        // Day selections (derived from to/from selections)
        monday: !!data.monday_to_work || !!data.monday_to_home,
        tuesday: !!data.tuesday_to_work || !!data.tuesday_to_home,
        wednesday: !!data.wednesday_to_work || !!data.wednesday_to_home,
        thursday: !!data.thursday_to_work || !!data.thursday_to_home,
        friday: !!data.friday_to_work || !!data.friday_to_home,
        saturday: !!data.saturday_to_work || !!data.saturday_to_home,
        sunday: !!data.sunday_to_work || !!data.sunday_to_home,
        
        // Direction-specific commute types
        monday_to_work: data.monday_to_work,
        monday_to_home: data.monday_to_home,
        tuesday_to_work: data.tuesday_to_work,
        tuesday_to_home: data.tuesday_to_home,
        wednesday_to_work: data.wednesday_to_work,
        wednesday_to_home: data.wednesday_to_home,
        thursday_to_work: data.thursday_to_work,
        thursday_to_home: data.thursday_to_home,
        friday_to_work: data.friday_to_work,
        friday_to_home: data.friday_to_home,
        saturday_to_work: data.saturday_to_work,
        saturday_to_home: data.saturday_to_home,
        sunday_to_work: data.sunday_to_work,
        sunday_to_home: data.sunday_to_home,
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
      form.reset({
        week_selection: "current",
        commute_type: "",
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        monday_to_work: "",
        monday_to_home: "",
        tuesday_to_work: "",
        tuesday_to_home: "",
        wednesday_to_work: "",
        wednesday_to_home: "",
        thursday_to_work: "",
        thursday_to_home: "",
        friday_to_work: "",
        friday_to_home: "",
        saturday_to_work: "",
        saturday_to_home: "",
        sunday_to_work: "",
        sunday_to_home: "",
      });
      
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

  // Helper to check if home/work locations are set
  const locationConfigured = user && 
    'home_address' in user && 
    'work_address' in user && 
    !!user.home_address && 
    !!user.work_address;
  
  // Find the first day with commute data to set as active
  useEffect(() => {
    const values = form.getValues();
    for (const day of DAYS_OF_WEEK) {
      if (values[`${day.id}_to_work` as keyof typeof values] || values[`${day.id}_to_home` as keyof typeof values]) {
        setActiveDay(day.id);
        break;
      }
    }
  }, [form.watch("monday_to_work"), form.watch("tuesday_to_work")]);

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
                <Link href="/profile">
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
                <FormItem className="space-y-1">
                  <FormLabel>Week to log</FormLabel>
                  <div className="flex flex-wrap items-center gap-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.value === "current"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "current" : "previous");
                          }}
                          id="week-toggle"
                        />
                        <label
                          htmlFor="week-toggle"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {field.value === "current" ? "Current Week" : "Previous Week"} 
                          <span className="text-xs text-gray-500 ml-2">
                            ({field.value === "current" 
                              ? format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d') 
                              : format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'MMM d')} 
                            - 
                            {field.value === "current"
                              ? format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'MMM d') 
                              : format(addDays(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 6), 'MMM d')})
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <Badge variant="outline" className="ml-auto border-green-200 text-green-700 bg-green-50">
                      <span className="material-icons text-xs mr-1">calendar_today</span>
                      {field.value === "current" ? "This Week" : "Last Week"}
                    </Badge>
                  </div>
                  <FormDescription className="text-xs">
                    You can only log commutes for the current or previous week.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            {/* Default Commute Method */}
            <FormField
              control={form.control}
              name="commute_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default commute method</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      applyDefaultToAll(value);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select how you usually commute" />
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
                  <FormDescription>
                    This will be applied to any days you select that don't have a specific commute method set.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Day Selection with Weekly Calendar UI */}
            <div className="space-y-3">
              <FormLabel>Daily Commutes</FormLabel>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {DAYS_OF_WEEK.map((day, index) => {
                  const isActive = form.getValues(`${day.id}_to_work`) || form.getValues(`${day.id}_to_home`);
                  const date = weekDates[index];
                  const formattedDate = date ? format(date, 'd') : '';
                  
                  return (
                    <div key={day.id} className="text-center">
                      <div 
                        className={`text-xs font-medium mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                      >
                        {day.short}
                      </div>
                      <Button
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`w-full h-10 p-0 ${isActive ? 'bg-primary text-white' : 'text-gray-700'}`}
                        onClick={() => setActiveDay(day.id)}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-sm">{formattedDate}</span>
                          {isActive && (
                            <div className="flex mt-1 space-x-1">
                              {form.getValues(`${day.id}_to_work`) && (
                                <span className="material-icons text-[10px]">arrow_outward</span>
                              )}
                              {form.getValues(`${day.id}_to_home`) && (
                                <span className="material-icons text-[10px]">arrow_downward</span>
                              )}
                            </div>
                          )}
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {/* Daily Commute Details */}
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div 
                      key={day.id} 
                      className={activeDay === day.id ? 'block' : 'hidden'}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium capitalize">
                          {day.name}
                          {weekDates[DAYS_OF_WEEK.findIndex(d => d.id === day.id)] && (
                            <span className="text-sm text-gray-500 font-normal ml-2">
                              ({format(weekDates[DAYS_OF_WEEK.findIndex(d => d.id === day.id)], 'MMMM d')})
                            </span>
                          )}
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name={day.id as any}
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Log this day</span>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (!checked) {
                                    // Clear commute selections if day is deselected
                                    form.setValue(`${day.id}_to_work` as any, "");
                                    form.setValue(`${day.id}_to_home` as any, "");
                                  } else if (form.getValues('commute_type')) {
                                    // Apply default commute type if one is set
                                    form.setValue(`${day.id}_to_work` as any, form.getValues('commute_type'));
                                    form.setValue(`${day.id}_to_home` as any, form.getValues('commute_type'));
                                  }
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* To Work */}
                        <FormField
                          control={form.control}
                          name={`${day.id}_to_work` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-blue-600">
                                <span className="material-icons mr-1 text-sm">arrow_forward</span>
                                To Work
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  updateDaySelection(day.id);
                                }}
                                value={field.value || ""}
                                disabled={!form.getValues(day.id as any)}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="How did you get to work?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">-- Not logged --</SelectItem>
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
                        
                        {/* To Home */}
                        <FormField
                          control={form.control}
                          name={`${day.id}_to_home` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-indigo-600">
                                <span className="material-icons mr-1 text-sm">arrow_back</span>
                                Back Home
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  updateDaySelection(day.id);
                                }}
                                value={field.value || ""}
                                disabled={!form.getValues(day.id as any)}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="How did you get back home?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">-- Not logged --</SelectItem>
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
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
                  Save Weekly Commute
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WeeklyCommuteForm;