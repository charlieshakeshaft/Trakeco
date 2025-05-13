import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commuteTypeOptions } from "@/lib/constants";
import { startOfWeek, subWeeks, format } from "date-fns";
import { Link } from "wouter";
import { Plus, X, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WeeklyCommuteFormProps {
  userId: number;
  onSuccess?: () => void;
}

// A single commute entry
interface CommuteEntry {
  commute_type: string;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

// Simplified schema for a single commute method
const singleCommuteSchema = z.object({
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

// Form for selecting week
const weekSelectionSchema = z.object({
  week_selection: z.enum(["current", "previous"])
});

type SingleCommuteValues = z.infer<typeof singleCommuteSchema>;
type WeekSelectionValues = z.infer<typeof weekSelectionSchema>;

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
  const [selectedWeek, setSelectedWeek] = useState<"current" | "previous">("current");
  const [commuteEntries, setCommuteEntries] = useState<CommuteEntry[]>([]);
  
  // State to track which entry form is currently being edited
  const [activeEntryIndex, setActiveEntryIndex] = useState<number | null>(null);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Get current week's start date (Monday)
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  const [previousWeekStart, setPreviousWeekStart] = useState(() => {
    // Get previous week's start date
    return startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
  });
  
  // Fetch existing commute logs
  const { data: commuteLogs } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 0, // Always get fresh data
  });
  
  // Determine which week's logs to display based on the selected week
  const activeWeekStart = selectedWeek === "current" ? currentWeekStart : previousWeekStart;
  
  // Find all logs for the selected week
  const weekLogs = commuteLogs?.filter(log => {
    const logDate = new Date(log.week_start);
    const formattedLogDate = format(logDate, 'yyyy-MM-dd');
    const formattedActiveDate = format(activeWeekStart, 'yyyy-MM-dd');
    return formattedLogDate === formattedActiveDate;
  });
  
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
    
  // Initialize form for a single commute entry
  const entryForm = useForm<SingleCommuteValues>({
    resolver: zodResolver(singleCommuteSchema),
    defaultValues: {
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
  
  // Initialize week selection form
  const weekForm = useForm<WeekSelectionValues>({
    resolver: zodResolver(weekSelectionSchema),
    defaultValues: {
      week_selection: "current"
    }
  });
  
  // Process existing week logs data
  useEffect(() => {
    if (weekLogs && weekLogs.length > 0) {
      // Check which days are already logged and with what commute types
      const commuteTypesByDay: Record<string, string[]> = {};
      
      // Process each log entry for the week
      weekLogs.forEach(log => {
        // Create an entry in commuteTypesByDay for this commute type if it doesn't exist
        if (!commuteTypesByDay[log.commute_type]) {
          commuteTypesByDay[log.commute_type] = [];
        }
        
        // Add days from this log to the appropriate commute type
        if (log.monday) commuteTypesByDay[log.commute_type].push("monday");
        if (log.tuesday) commuteTypesByDay[log.commute_type].push("tuesday");
        if (log.wednesday) commuteTypesByDay[log.commute_type].push("wednesday");
        if (log.thursday) commuteTypesByDay[log.commute_type].push("thursday");
        if (log.friday) commuteTypesByDay[log.commute_type].push("friday");
        if (log.saturday) commuteTypesByDay[log.commute_type].push("saturday");
        if (log.sunday) commuteTypesByDay[log.commute_type].push("sunday");
      });
      
      // Create commute entries from existing data
      const entries: CommuteEntry[] = [];
      
      Object.entries(commuteTypesByDay).forEach(([commuteType, days]) => {
        const entry: CommuteEntry = {
          commute_type: commuteType,
          days: {
            monday: days.includes("monday"),
            tuesday: days.includes("tuesday"),
            wednesday: days.includes("wednesday"),
            thursday: days.includes("thursday"),
            friday: days.includes("friday"),
            saturday: days.includes("saturday"),
            sunday: days.includes("sunday")
          }
        };
        entries.push(entry);
      });
      
      // Update the state
      setCommuteEntries(entries);
    } else {
      // No existing logs for this week
      setCommuteEntries([]);
    }
  }, [weekLogs]);
  
  // Add a new commute entry form
  const addCommuteEntry = () => {
    // Clear and prepare form for a new entry
    entryForm.reset({
      commute_type: "",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    });
    
    // Set active entry index to -1 (new entry)
    setActiveEntryIndex(-1);
  };
  
  // Edit an existing commute entry
  const editCommuteEntry = (index: number) => {
    const entry = commuteEntries[index];
    
    // Set form values from the entry
    entryForm.reset({
      commute_type: entry.commute_type,
      monday: entry.days.monday,
      tuesday: entry.days.tuesday,
      wednesday: entry.days.wednesday,
      thursday: entry.days.thursday,
      friday: entry.days.friday,
      saturday: entry.days.saturday,
      sunday: entry.days.sunday,
    });
    
    // Set active entry index
    setActiveEntryIndex(index);
  };
  
  // Remove a commute entry
  const removeCommuteEntry = (index: number) => {
    setCommuteEntries(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Save the current entry form
  const saveEntryForm = (data: SingleCommuteValues) => {
    const newEntry: CommuteEntry = {
      commute_type: data.commute_type,
      days: {
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday
      }
    };
    
    if (activeEntryIndex === -1) {
      // Add new entry
      setCommuteEntries(current => [...current, newEntry]);
    } else {
      // Update existing entry
      setCommuteEntries(current => {
        const updated = [...current];
        updated[activeEntryIndex] = newEntry;
        return updated;
      });
    }
    
    // Clear active entry index
    setActiveEntryIndex(null);
  };
  
  // Handle week change
  const handleWeekChange = (value: string) => {
    if (value === "current" || value === "previous") {
      setSelectedWeek(value);
      weekForm.setValue("week_selection", value);
    }
  };
  
  // Submit all commute entries
  const submitCommuteEntries = async () => {
    if (commuteEntries.length === 0) {
      toast({
        title: "No entries",
        description: "Please add at least one commute method before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the selected week's start date
      const now = new Date();
      const weekStartDate = selectedWeek === "current"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      
      // Process all entries sequentially
      for (const entry of commuteEntries) {
        const daysLogged = Object.values(entry.days).filter(Boolean).length;
        
        if (daysLogged === 0) continue; // Skip entries with no days selected
        
        console.log("Submitting commute log:", {
          commute_type: entry.commute_type,
          days_logged: daysLogged,
          distance_km: commuteDistance,
          week_start: format(weekStartDate, 'yyyy-MM-dd'),
          ...entry.days
        });
        
        await apiRequest(`/api/commutes/log?userId=${userId}`, {
          commute_type: entry.commute_type,
          days_logged: daysLogged,
          distance_km: commuteDistance,
          week_start: format(weekStartDate, 'yyyy-MM-dd'),
          ...entry.days
        }, "POST");
      }
      
      // Success notification
      toast({
        title: "Success",
        description: "Your weekly commutes have been logged successfully!",
      });
      
      // Refresh commute logs data
      queryClient.invalidateQueries({ queryKey: [`/api/commutes/current?userId=${userId}`] });
      
      // Notify parent component of success if callback is provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to log weekly commutes: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl">Log Weekly Commutes</CardTitle>
        <CardDescription>
          Track different commute methods across your week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!locationConfigured && (
          <Alert className="mb-4 bg-amber-50">
            <AlertDescription>
              Please <Link href="/profile" className="underline font-medium">update your profile</Link> with home and work addresses to better track your carbon impact.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Week Selection */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Select Week</h3>
          <RadioGroup
            value={selectedWeek}
            onValueChange={handleWeekChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="current" />
              <label htmlFor="current" className="cursor-pointer">Current week</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="previous" id="previous" />
              <label htmlFor="previous" className="cursor-pointer">Previous week</label>
            </div>
          </RadioGroup>
        </div>
        
        {/* List of existing commute entries */}
        {commuteEntries.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium">Your Commute Methods This Week</h3>
            
            {commuteEntries.map((entry, index) => {
              const daysUsed = Object.entries(entry.days)
                .filter(([_, used]) => used)
                .map(([day]) => DAYS_OF_WEEK.find(d => d.id === day)?.short || day)
                .join(", ");
                
              return (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold capitalize">{entry.commute_type}</h4>
                      <p className="text-sm text-gray-600">Days: {daysUsed}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editCommuteEntry(index)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeCommuteEntry(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Add new commute entry button */}
        {activeEntryIndex === null && (
          <Button 
            variant="outline" 
            className="mb-6 w-full"
            onClick={addCommuteEntry}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Commute Method
          </Button>
        )}
        
        {/* Commute entry form */}
        {activeEntryIndex !== null && (
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {activeEntryIndex === -1 ? "Add New Commute Method" : "Edit Commute Method"}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveEntryIndex(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...entryForm}>
              <form onSubmit={entryForm.handleSubmit(saveEntryForm)} className="space-y-4">
                {/* Commute method */}
                <FormField
                  control={entryForm.control}
                  name="commute_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commute Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a commute method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commuteTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Days selection */}
                <div>
                  <FormLabel>Days Used</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <FormField
                        key={day.id}
                        control={entryForm.control}
                        name={day.id as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer">
                              {day.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    Select the days you used this commute method
                  </FormDescription>
                  {entryForm.formState.errors.monday && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {entryForm.formState.errors.monday.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {activeEntryIndex === -1 ? "Add Method" : "Update Method"}
                </Button>
              </form>
            </Form>
          </div>
        )}
        
        {/* Submit all entries */}
        {commuteEntries.length > 0 && activeEntryIndex === null && (
          <Button 
            className="w-full" 
            disabled={isSubmitting} 
            onClick={submitCommuteEntries}
          >
            {isSubmitting ? "Saving..." : "Save Weekly Commutes"}
          </Button>
        )}
        
        {commuteEntries.length === 0 && activeEntryIndex === null && (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Please add a commute method to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyCommuteFormSimple;