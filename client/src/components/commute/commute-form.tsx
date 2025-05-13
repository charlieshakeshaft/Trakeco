import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
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

interface CommuteFormProps {
  userId: number;
  onSuccess?: () => void;
}

const commuteSchema = z.object({
  commute_type: z.string().min(1, "Please select a commute type"),
  // Add day-specific fields
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
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

  const commuteLogMutation = useMutation({
    mutationFn: async (data: CommuteFormValues) => {
      // Get the start of the current week (Sunday)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      
      return await apiRequest(`/api/commutes?userId=${userId}`, {
        commute_type: data.commute_type,
        days_logged: data.days_logged,
        distance_km: data.distance_km,
        week_start: weekStart.toISOString(),
        user_id: userId, // Explicitly include the user ID in the request body as well
        // Include day-specific fields
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday
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
        days_logged: 0,
        distance_km: 0,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Your Commute</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="commute_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you commute today?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select commute type" />
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
              <FormLabel>Select days you commuted this way:</FormLabel>
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
                                field.onChange(checked);
                                setTimeout(updateDaysLogged, 0);
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
              {form.formState.errors.days_logged && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.days_logged.message}</p>
              )}
            </div>

            {/* Days logged and distance fields have been removed as requested */}

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
