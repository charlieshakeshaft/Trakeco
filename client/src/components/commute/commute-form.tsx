import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commuteTypeOptions } from "@/lib/constants";
import { startOfWeek, getDay } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommuteFormProps {
  userId: number;
  onSuccess?: () => void;
}

// Enhanced schema for commute logging with to/from options for each day
const commuteSchema = z.object({
  // Basic fields for backward compatibility
  commute_type: z.string().min(1, "Please select a default commute type"),
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
  // Ensure at least one day is selected
  const selectedDays = [
    data.monday, data.tuesday, data.wednesday, data.thursday, 
    data.friday, data.saturday, data.sunday
  ].filter(Boolean).length;
  
  return selectedDays > 0;
}, {
  message: "Please select at least one day",
  path: ["monday"],
});

type CommuteFormValues = z.infer<typeof commuteSchema>;

const CommuteForm = ({ userId, onSuccess }: CommuteFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("monday");

  // Fetch user profile to get commute distance
  const { data: user } = useQuery({
    queryKey: [`/api/user/profile?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  // Base distance is the walking distance stored in user profile
  const baseDistance = user?.commute_distance_km || 5;
  
  // Calculate adjusted distance based on transport mode
  const getAdjustedDistance = (commuteType: string): number => {
    // Different transport modes have different route efficiencies
    const distanceFactors: Record<string, number> = {
      walk: 1.0,                  // walking distance is the baseline
      cycle: 0.8,                 // cycling routes can be more direct/efficient
      public_transport: 1.2,      // public transport often has detours
      carpool: 1.1,               // carpooling might take slight detours
      electric_vehicle: 1.1,      // car routes might be slightly longer than walking
      gas_vehicle: 1.1,           // same as electric
      remote_work: 0              // no distance for remote work
    };
    
    const factor = distanceFactors[commuteType] || 1.0;
    const adjustedDistance = baseDistance * factor;
    
    // Round to 1 decimal place for readability
    return Math.round(adjustedDistance * 10) / 10;
  };

  const form = useForm<CommuteFormValues>({
    resolver: zodResolver(commuteSchema),
    defaultValues: {
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
  
  // Get today's day of the week
  const today = getDay(new Date());
  
  // Calculate number of selected days
  const calculateSelectedDays = () => {
    return [
      form.getValues('monday'),
      form.getValues('tuesday'),
      form.getValues('wednesday'),
      form.getValues('thursday'),
      form.getValues('friday'),
      form.getValues('saturday'),
      form.getValues('sunday')
    ].filter(Boolean).length;
  };

  // Set the commute type for a specific day and direction
  const setDayCommute = (day: string, direction: 'to_work' | 'to_home', value: string) => {
    const fieldName = `${day}_${direction}` as keyof CommuteFormValues;
    form.setValue(fieldName, value);
  };

  // Apply the selected commute type to all checked days
  const applyToAllCheckedDays = (commuteType: string, direction: 'to_work' | 'to_home') => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      if (form.getValues(day as keyof CommuteFormValues)) {
        setDayCommute(day, direction, commuteType);
      }
    });
  };

  // When a day checkbox is toggled, manage the to/from commute selections
  const handleDayToggle = (day: string, checked: boolean) => {
    // Update the day selection
    form.setValue(day as keyof CommuteFormValues, checked);
    
    // If checked, set the default commute type for to/from
    if (checked) {
      const defaultCommuteType = form.getValues('commute_type');
      if (defaultCommuteType) {
        setDayCommute(day, 'to_work', defaultCommuteType);
        setDayCommute(day, 'to_home', defaultCommuteType);
      }
    }
  };

  // Track the currently selected commute type
  const [selectedCommuteType, setSelectedCommuteType] = useState<string>("");
  
  // Get the adjusted distance for the current commute type
  const getDisplayDistance = () => {
    return getAdjustedDistance(selectedCommuteType || form.getValues('commute_type'));
  };
  
  const commuteLogMutation = useMutation({
    mutationFn: async (data: CommuteFormValues) => {
      // Get the start of the current week (Sunday)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      
      // Calculate days logged from selected days
      const daysLogged = calculateSelectedDays();
      
      // Calculate adjusted distance based on the selected commute type
      const adjustedDistance = getAdjustedDistance(data.commute_type);
      
      return await apiRequest(`/api/commutes?userId=${userId}`, {
        commute_type: data.commute_type,
        days_logged: daysLogged,
        distance_km: adjustedDistance,
        week_start: weekStart.toISOString(),
        user_id: userId,
        // Include day-specific fields
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
        // Include to/from commute types for each day
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
  const locationConfigured = user?.home_address && user?.work_address;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Your Commute</CardTitle>
      </CardHeader>
      <CardContent>
        {!locationConfigured && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">
              For accurate distance tracking, please set your home and work locations in your profile.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="commute_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default commute method</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Update the selected commute type to recalculate distance
                      setSelectedCommuteType(value);
                      // Apply this commute type to all selected days if they don't have specific types set
                      form.getValues().monday && !form.getValues().monday_to_work && setDayCommute('monday', 'to_work', value);
                      form.getValues().monday && !form.getValues().monday_to_home && setDayCommute('monday', 'to_home', value);
                      // ...apply to other days similarly
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select commute method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commuteTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span className="material-icons mr-2 text-sm">{option.icon}</span>
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
            
            <div className="space-y-3">
              <FormLabel>Select days you commuted:</FormLabel>
              <div className="grid grid-cols-7 gap-2">
                {/* Monday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="monday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('monday', !!checked);
                                if (checked) setActiveDay("monday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Mon</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Tuesday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="tuesday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('tuesday', !!checked);
                                if (checked) setActiveDay("tuesday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Tue</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Wednesday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="wednesday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('wednesday', !!checked);
                                if (checked) setActiveDay("wednesday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Wed</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Thursday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="thursday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('thursday', !!checked);
                                if (checked) setActiveDay("thursday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Thu</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Friday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="friday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('friday', !!checked);
                                if (checked) setActiveDay("friday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Fri</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Saturday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="saturday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('saturday', !!checked);
                                if (checked) setActiveDay("saturday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Sat</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Sunday */}
                <div className="flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name="sunday"
                    render={({ field }) => (
                      <FormItem className="space-y-0 text-center">
                        <FormControl>
                          <div className="flex flex-col items-center space-y-1">
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={(checked) => {
                                handleDayToggle('sunday', !!checked);
                                if (checked) setActiveDay("sunday");
                              }} 
                              className={field.value ? "border-primary" : ""}
                            />
                            <span className="text-xs">Sun</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {form.formState.errors.monday && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.monday.message}</p>
              )}
            </div>

            {/* Day-specific commute method selection */}
            {calculateSelectedDays() > 0 && (
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="font-medium">Day-specific commute methods</h3>
                
                {/* Day selector tabs */}
                <TabsList className="grid grid-cols-7 w-full">
                  {form.getValues('monday') && (
                    <TabsTrigger
                      value="monday"
                      onClick={() => setActiveDay("monday")}
                      className={activeDay === "monday" ? "bg-primary text-white" : ""}
                    >
                      Mon
                    </TabsTrigger>
                  )}
                  {form.getValues('tuesday') && (
                    <TabsTrigger
                      value="tuesday"
                      onClick={() => setActiveDay("tuesday")}
                      className={activeDay === "tuesday" ? "bg-primary text-white" : ""}
                    >
                      Tue
                    </TabsTrigger>
                  )}
                  {form.getValues('wednesday') && (
                    <TabsTrigger
                      value="wednesday"
                      onClick={() => setActiveDay("wednesday")}
                      className={activeDay === "wednesday" ? "bg-primary text-white" : ""}
                    >
                      Wed
                    </TabsTrigger>
                  )}
                  {form.getValues('thursday') && (
                    <TabsTrigger
                      value="thursday"
                      onClick={() => setActiveDay("thursday")}
                      className={activeDay === "thursday" ? "bg-primary text-white" : ""}
                    >
                      Thu
                    </TabsTrigger>
                  )}
                  {form.getValues('friday') && (
                    <TabsTrigger
                      value="friday"
                      onClick={() => setActiveDay("friday")}
                      className={activeDay === "friday" ? "bg-primary text-white" : ""}
                    >
                      Fri
                    </TabsTrigger>
                  )}
                  {form.getValues('saturday') && (
                    <TabsTrigger
                      value="saturday"
                      onClick={() => setActiveDay("saturday")}
                      className={activeDay === "saturday" ? "bg-primary text-white" : ""}
                    >
                      Sat
                    </TabsTrigger>
                  )}
                  {form.getValues('sunday') && (
                    <TabsTrigger
                      value="sunday"
                      onClick={() => setActiveDay("sunday")}
                      className={activeDay === "sunday" ? "bg-primary text-white" : ""}
                    >
                      Sun
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {/* To Work selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>To work:</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (form.getValues('commute_type')) {
                          applyToAllCheckedDays(form.getValues('commute_type'), 'to_work');
                          toast({
                            title: "Applied to all days",
                            description: "Your default commute type has been applied to all selected days."
                          });
                        }
                      }}
                    >
                      Apply to all days
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`${activeDay}_to_work` as keyof CommuteFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select commute method to work" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commuteTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <span className="material-icons mr-2 text-sm">{option.icon}</span>
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
                
                <Separator />
                
                {/* To Home selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>To home:</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (form.getValues('commute_type')) {
                          applyToAllCheckedDays(form.getValues('commute_type'), 'to_home');
                          toast({
                            title: "Applied to all days",
                            description: "Your default commute type has been applied to all selected days."
                          });
                        }
                      }}
                    >
                      Apply to all days
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`${activeDay}_to_home` as keyof CommuteFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select commute method to home" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commuteTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center">
                                  <span className="material-icons mr-2 text-sm">{option.icon}</span>
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
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging..." : "Log Commute"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CommuteForm;