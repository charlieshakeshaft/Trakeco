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
import { Plus, X, Check, Edit, Trash } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CommuteFormProps {
  userId: number;
  onSuccess?: () => void;
  isProfileComplete?: boolean;
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
  id?: number; // ID from the database for existing entries
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

const CommuteForm = ({ userId, onSuccess, isProfileComplete = true }: CommuteFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for tracking
  const [commuteEntries, setCommuteEntries] = useState<CommuteEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading overlay
  const [weekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [deletedLogIds, setDeletedLogIds] = useState<number[]>([]); // Store IDs of logs to delete
  
  // Fetch existing commute logs for the current week
  const { data: existingCommuteLogs, isLoading: isLoadingCommutes } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Entry form
  const form = useForm<z.infer<typeof singleCommuteSchema>>({
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
  
  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!userId,
  });
  
  // Check if location is configured (only after data is loaded)
  // Use a more robust check that accounts for empty strings and null values
  const locationConfigured = !isLoadingProfile && (
    !!userProfile?.home_address && userProfile.home_address.trim() !== '' && 
    !!userProfile?.work_address && userProfile.work_address.trim() !== ''
  );
  
  // Get commute distance
  const commuteDistance = userProfile?.commute_distance_km || 0;
  
  // Track which days are already used by other commute methods
  const [usedDays, setUsedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  
  // Track which commute methods are already in use
  const [usedMethods, setUsedMethods] = useState<string[]>([]);
  
  // Process existing commute logs and populate entries when data loads
  useEffect(() => {
    if (existingCommuteLogs && Array.isArray(existingCommuteLogs) && existingCommuteLogs.length > 0 && commuteEntries.length === 0) {
      console.log("Loading existing commute logs:", existingCommuteLogs);
      
      // Group logs by commute type
      const entriesByType: Record<string, CommuteEntry> = {};
      
      // Also track which days are already used
      const daysInUse = {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      };
      
      existingCommuteLogs.forEach((log) => {
        // Create entry if it doesn't exist for this type
        if (!entriesByType[log.commute_type]) {
          entriesByType[log.commute_type] = {
            commute_type: log.commute_type,
            days: {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false
            },
            id: log.id // Store the ID for deletion tracking
          };
        }
        
        // Update days based on the log
        if (log.monday) {
          entriesByType[log.commute_type].days.monday = true;
          daysInUse.monday = true;
        }
        if (log.tuesday) {
          entriesByType[log.commute_type].days.tuesday = true;
          daysInUse.tuesday = true;
        }
        if (log.wednesday) {
          entriesByType[log.commute_type].days.wednesday = true;
          daysInUse.wednesday = true;
        }
        if (log.thursday) {
          entriesByType[log.commute_type].days.thursday = true;
          daysInUse.thursday = true;
        }
        if (log.friday) {
          entriesByType[log.commute_type].days.friday = true;
          daysInUse.friday = true;
        }
        if (log.saturday) {
          entriesByType[log.commute_type].days.saturday = true;
          daysInUse.saturday = true;
        }
        if (log.sunday) {
          entriesByType[log.commute_type].days.sunday = true;
          daysInUse.sunday = true;
        }
      });
      
      // Convert to array of entries and update state
      const entries = Object.values(entriesByType);
      console.log("Loading existing commute logs:", entries);
      setCommuteEntries(entries);
      
      // Set the used days
      setUsedDays(daysInUse);
      
      // Set the used commute methods
      const methods = Object.keys(entriesByType);
      console.log("Used commute methods:", methods);
      setUsedMethods(methods);
    }
  }, [existingCommuteLogs, commuteEntries.length]);
  
  // Update usedDays and usedMethods when editing an entry
  useEffect(() => {
    // Calculate which days are used by entries except the one being edited
    const daysInUse = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    };
    
    // Track which commute methods are used (except the one being edited)
    const methodsInUse: string[] = [];
    
    commuteEntries.forEach((entry, index) => {
      // Skip the entry being edited
      if (editingIndex !== null && index === editingIndex) {
        return;
      }
      
      // Add commute method to list
      if (!methodsInUse.includes(entry.commute_type)) {
        methodsInUse.push(entry.commute_type);
      }
      
      // Mark days as used
      if (entry.days.monday) daysInUse.monday = true;
      if (entry.days.tuesday) daysInUse.tuesday = true;
      if (entry.days.wednesday) daysInUse.wednesday = true;
      if (entry.days.thursday) daysInUse.thursday = true;
      if (entry.days.friday) daysInUse.friday = true;
      if (entry.days.saturday) daysInUse.saturday = true;
      if (entry.days.sunday) daysInUse.sunday = true;
    });
    
    setUsedDays(daysInUse);
    setUsedMethods(methodsInUse);
  }, [commuteEntries, editingIndex]);

  // Add new commute method
  const addCommuteMethod = () => {
    form.reset();
    setEditingIndex(null);
    setShowForm(true);
  };

  // Edit existing commute method
  const editCommuteMethod = (index: number) => {
    const entry = commuteEntries[index];
    form.reset({
      commute_type: entry.commute_type,
      ...entry.days
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  // Remove commute method - only removes from UI, doesn't sync with server until Save is clicked
  const removeCommuteMethod = (index: number) => {
    const entryToRemove = commuteEntries[index];
    
    // If this entry has an ID, add it to the list of logs to delete on save
    if (entryToRemove.id) {
      setDeletedLogIds(current => [...current, entryToRemove.id!]);
    }
    
    // Remove from UI - no server call until Save button is clicked
    setCommuteEntries(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
    
    toast({
      title: "Method Removed",
      description: "Commute method has been removed from the form. Click 'Save All Commute Entries' to save your changes.",
    });
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof singleCommuteSchema>) => {
    // Create the entry
    const entry: CommuteEntry = {
      commute_type: data.commute_type,
      days: {
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
      }
    };
    
    // Update entries
    if (editingIndex !== null) {
      // Update existing entry
      setCommuteEntries(current => {
        const updated = [...current];
        updated[editingIndex] = entry;
        return updated;
      });
      toast({
        title: "Method Updated",
        description: `Your ${data.commute_type.replace('_', ' ')} commute has been updated.`,
      });
    } else {
      // Add new entry
      setCommuteEntries(current => [...current, entry]);
      toast({
        title: "Method Added",
        description: `Your ${data.commute_type.replace('_', ' ')} commute has been added.`,
      });
    }
    
    // Close form and reset
    setShowForm(false);
    setEditingIndex(null);
    form.reset();
  };

  // Save all commute entries
  const saveAllEntries = async () => {
    if (commuteEntries.length === 0 && deletedLogIds.length === 0) {
      toast({
        title: "No Methods Added",
        description: "Please add at least one commute method.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true); // Enable loading overlay
    
    try {
      // First, delete any logs that were removed
      for (const logId of deletedLogIds) {
        try {
          // Delete the commute log on the server
          await fetch(`/api/commutes/${logId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Deleted commute log with ID: ${logId}`);
        } catch (err) {
          console.error(`Failed to delete commute log with ID: ${logId}`, err);
        }
      }
      
      // Process each entry
      for (const entry of commuteEntries) {
        // Count selected days
        const daysLogged = Object.values(entry.days).filter(Boolean).length;
        
        // Skip entries with no days selected
        if (daysLogged === 0) continue;
        
        // Log the commute data
        await apiRequest('/api/commutes/log', {
          commute_type: entry.commute_type,
          days_logged: daysLogged,
          distance_km: commuteDistance,
          week_start: format(weekStart, 'yyyy-MM-dd'),
          ...entry.days
        }, 'POST');
      }
      
      // Reset deleted log IDs after processing
      setDeletedLogIds([]);
      
      // Success notification
      toast({
        title: "Success",
        description: "Your weekly commutes have been logged successfully!",
      });
      
      // Refresh all relevant data
      await queryClient.invalidateQueries({ queryKey: ['/api/commutes/current'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      // Reload the commute logs to ensure we have the latest data
      const response = await fetch(`/api/commutes/current?userId=${userId}`, {
        credentials: 'include' // Add credentials for authentication
      });
      if (response.ok) {
        const updatedLogs = await response.json();
        
        // Convert backend format to our UI format
        if (updatedLogs && Array.isArray(updatedLogs)) {
          const entriesByType: Record<string, CommuteEntry> = {};
          
          updatedLogs.forEach((log) => {
            if (!entriesByType[log.commute_type]) {
              entriesByType[log.commute_type] = {
                commute_type: log.commute_type,
                days: {
                  monday: false,
                  tuesday: false,
                  wednesday: false,
                  thursday: false,
                  friday: false,
                  saturday: false,
                  sunday: false
                }
              };
            }
            
            // Update days based on the log
            if (log.monday) entriesByType[log.commute_type].days.monday = true;
            if (log.tuesday) entriesByType[log.commute_type].days.tuesday = true;
            if (log.wednesday) entriesByType[log.commute_type].days.wednesday = true;
            if (log.thursday) entriesByType[log.commute_type].days.thursday = true;
            if (log.friday) entriesByType[log.commute_type].days.friday = true;
            if (log.saturday) entriesByType[log.commute_type].days.saturday = true;
            if (log.sunday) entriesByType[log.commute_type].days.sunday = true;
          });
          
          // Update the state with the fresh data from the server
          setCommuteEntries(Object.values(entriesByType));
        }
      }
      
      // Notify parent component of success if callback is provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close form
      setShowForm(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to log weekly commutes: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false); // Disable loading overlay
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-foreground font-medium">Saving your commute data...</p>
            <p className="text-muted-foreground text-sm mt-2">Please don't navigate away</p>
          </div>
        </div>
      )}
      
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl">Log Weekly Commutes</CardTitle>
        <CardDescription>
          Track different commute methods across your week
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        
        {/* Entries list */}
        {commuteEntries.length > 0 ? (
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Your Commute Methods</h3>
              <Badge variant="outline" className="bg-green-50">
                {commuteEntries.length} method{commuteEntries.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {commuteEntries.map((entry, index) => {
              const daysUsed = Object.entries(entry.days)
                .filter(([_, used]) => used)
                .map(([day]) => DAYS_OF_WEEK.find(d => d.id === day)?.short || day)
                .join(", ");
                
              const formattedType = entry.commute_type.replace(/_/g, ' ');
              
              return (
                <Card key={index} className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold capitalize">{formattedType}</h4>
                      <p className="text-sm text-gray-600">Days: {daysUsed || "None selected"}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editCommuteMethod(index)}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeCommuteMethod(index)}
                        className="text-red-500 hover:text-red-700 gap-1"
                      >
                        <Trash className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Alert className="mb-6">
            <AlertTitle>No commute methods added yet</AlertTitle>
            <AlertDescription>
              Click the "Add Commute Method" button below to start adding your commute methods for this week.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Add Method Form */}
        {showForm ? (
          <Card className="mb-6 p-4 border-dashed">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {editingIndex !== null ? "Edit Commute Method" : "Add New Commute Method"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingIndex(null);
                  form.reset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="commute_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commute Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a commute method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commuteTypeOptions.map((option) => {
                            const isDisabled = editingIndex === null && usedMethods.includes(option.value);
                            
                            return (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                disabled={isDisabled}
                              >
                                {option.label}
                                {isDisabled && (
                                  <span className="ml-1 text-xs text-gray-400">(already logged)</span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How did you travel to work?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Days Used</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayId = day.id as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
                      const isDisabled = usedDays[dayId];
                      
                      return (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name={dayId}
                          render={({ field }) => (
                            <FormItem className="flex space-x-3 space-y-0 items-center">
                              <FormControl>
                                <Checkbox
                                  checked={field.value || isDisabled}
                                  onCheckedChange={isDisabled ? undefined : field.onChange}
                                  disabled={isDisabled && !field.value}
                                />
                              </FormControl>
                              <FormLabel className={`${isDisabled && !field.value ? 'text-gray-400' : 'cursor-pointer'}`}>
                                {day.name}
                                {isDisabled && !field.value && (
                                  <span className="ml-1 text-xs text-gray-400">(in use)</span>
                                )}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </div>
                  <FormDescription className="mt-2">
                    Select the days you used this commute method
                  </FormDescription>
                </div>
                
                <Button type="submit" className="w-full">
                  {editingIndex !== null ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Method
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Method
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        ) : (
          <Button 
            onClick={addCommuteMethod} 
            variant="outline" 
            className="w-full mb-6"
            disabled={!isProfileComplete}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Commute Method
          </Button>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 flex justify-end border-t">
        <Button
          onClick={saveAllEntries}
          disabled={!isProfileComplete || commuteEntries.length === 0 || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save All Commute Entries
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommuteForm;