
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { getDietPlanById, createDietPlan, updateDietPlan } from '@/services/dietPlanService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Form schema
const dietPlanSchema = z.object({
  client_id: z.coerce.number().int().positive('Client ID is required'),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
  daily_calories: z.coerce.number().int().positive('Daily calories must be a positive number'),
  protein_grams: z.coerce.number().int().positive('Protein grams must be a positive number'),
  carbs_grams: z.coerce.number().int().positive('Carbs grams must be a positive number'),
  fats_grams: z.coerce.number().int().positive('Fats grams must be a positive number'),
  status: z.enum(['active', 'inactive', 'completed']),
  start_date: z.date(),
  end_date: z.date(),
}).refine(data => {
  return data.end_date >= data.start_date;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
});

type DietPlanFormSchema = z.infer<typeof dietPlanSchema>;

export default function DietPlanForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup form
  const form = useForm<DietPlanFormSchema>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: {
      client_id: 0,
      title: '',
      description: '',
      daily_calories: 2000,
      protein_grams: 150,
      carbs_grams: 225,
      fats_grams: 55,
      status: 'active',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    mode: 'onChange',
  });

  // Fetch diet plan if in edit mode
  const { data: dietPlan, isLoading: isLoadingDietPlan } = useQuery({
    queryKey: ['diet-plan', id],
    queryFn: () => getDietPlanById(Number(id)),
    enabled: isEditMode,
  });

  // Update form values when diet plan data is loaded
  useEffect(() => {
    if (dietPlan && isEditMode) {
      form.reset({
        client_id: dietPlan.client_id,
        title: dietPlan.title,
        description: dietPlan.description,
        daily_calories: dietPlan.daily_calories,
        protein_grams: dietPlan.protein_grams,
        carbs_grams: dietPlan.carbs_grams,
        fats_grams: dietPlan.fats_grams,
        status: dietPlan.status,
        start_date: new Date(dietPlan.start_date),
        end_date: new Date(dietPlan.end_date),
      });
    }
  }, [dietPlan, form, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDietPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({
        title: 'Diet plan created',
        description: 'The diet plan has been successfully created.',
      });
      navigate('/diet-plans');
    },
    onError: (error) => {
      console.error('Failed to create diet plan:', error);
      toast({
        title: 'Creation failed',
        description: 'There was an error creating the diet plan.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DietPlanFormSchema }) => 
      updateDietPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      queryClient.invalidateQueries({ queryKey: ['diet-plan', id] });
      toast({
        title: 'Diet plan updated',
        description: 'The diet plan has been successfully updated.',
      });
      navigate('/diet-plans');
    },
    onError: (error) => {
      console.error('Failed to update diet plan:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the diet plan.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: DietPlanFormSchema) => {
    const formData = {
      ...data,
      start_date: format(data.start_date, 'yyyy-MM-dd'),
      end_date: format(data.end_date, 'yyyy-MM-dd'),
    };

    if (isEditMode) {
      updateMutation.mutate({ id: Number(id), data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingDietPlan) {
    return <div className="container mx-auto py-6">Loading diet plan data...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Diet Plan' : 'Create New Diet Plan'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the details of an existing diet plan' 
              : 'Create a custom diet plan for your client'}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Diet plan title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the diet plan"
                        className="min-h-[120px]"
                        {...field}
                      />
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="daily_calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Calories</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="protein_grams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="carbs_grams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fats_grams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fats (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Diet Plan' : 'Create Diet Plan'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
