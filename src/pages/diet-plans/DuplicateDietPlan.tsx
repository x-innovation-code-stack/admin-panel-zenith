
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { getDietPlanById, duplicateDietPlan } from '@/services/dietPlanService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Form schema
const duplicateSchema = z.object({
  new_title: z.string().min(2, 'Title is required'),
  client_id: z.coerce.number().int().positive('Client ID is required'),
  start_date: z.date(),
  end_date: z.date(),
}).refine(data => {
  return data.end_date >= data.start_date;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
});

type DuplicateFormSchema = z.infer<typeof duplicateSchema>;

export default function DuplicateDietPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup form
  const form = useForm<DuplicateFormSchema>({
    resolver: zodResolver(duplicateSchema),
    defaultValues: {
      new_title: '',
      client_id: 0,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    mode: 'onChange',
  });

  // Fetch original diet plan
  const { data: dietPlan, isLoading } = useQuery({
    queryKey: ['diet-plan', id],
    queryFn: () => getDietPlanById(Number(id)),
  });

  // Set initial form values once diet plan is loaded
  useEffect(() => {
    if (dietPlan) {
      form.reset({
        new_title: `Copy of ${dietPlan.title}`,
        client_id: dietPlan.client_id,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      });
    }
  }, [dietPlan, form]);

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (data: DuplicateFormSchema) => 
      duplicateDietPlan(Number(id), {
        ...data,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({
        title: 'Diet plan duplicated',
        description: 'The diet plan has been successfully duplicated.',
      });
      navigate('/diet-plans');
    },
    onError: (error) => {
      console.error('Failed to duplicate diet plan:', error);
      toast({
        title: 'Duplication failed',
        description: 'There was an error duplicating the diet plan.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: DuplicateFormSchema) => {
    duplicateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading diet plan data...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Duplicate Diet Plan</CardTitle>
          <CardDescription>
            Create a copy of "{dietPlan?.title}" with new dates
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="new_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for the duplicated plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter client ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Select date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/diet-plans')}
                disabled={duplicateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={duplicateMutation.isPending}>
                {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate Diet Plan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
