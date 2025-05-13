import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commuteTypeOptions } from "@/lib/constants";
import { startOfWeek } from "date-fns";

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
  days_logged: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 1 && val <= 5, {
    message: "Days must be between 1 and 5",
  }),
  distance_km: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 0, {
    message: "Distance must be a positive number",
  }),
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
      days_logged: "1",
      distance_km: "0",
    },
  });

  const commuteLogMutation = useMutation({
    mutationFn: async (data: CommuteFormValues) => {
      // Get the start of the current week (Sunday)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      
      return await apiRequest(`/api/commutes?userId=${userId}`, {
        commute_type: data.commute_type,
        days_logged: data.days_logged,
        distance_km: data.distance_km,
        week_start: weekStart.toISOString(),
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
        days_logged: "1",
        distance_km: "0",
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

            <FormField
              control={form.control}
              name="days_logged"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many days this week?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day} {day === 1 ? "day" : "days"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distance_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
