
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDietPlanById, createDietPlan, updateDietPlan } from '@/services/dietPlanService';
import { DietPlanFormData, DietPlan } from '@/types/dietPlan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DietPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: initialData, isLoading } = useQuery<DietPlan>({
    queryKey: ['diet-plan', id],
    queryFn: () => getDietPlanById(Number(id)),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<Partial<DietPlanFormData>>({
    client_id: initialData?.client_id || undefined,
    title: initialData?.title || '',
    description: initialData?.description || '',
    daily_calories: initialData?.daily_calories || 0,
    protein_grams: initialData?.protein_grams || 0,
    carbs_grams: initialData?.carbs_grams || 0,
    fats_grams: initialData?.fats_grams || 0,
    status: initialData?.status || 'active',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id,
        title: initialData.title,
        description: initialData.description,
        daily_calories: initialData.daily_calories,
        protein_grams: initialData.protein_grams,
        carbs_grams: initialData.carbs_grams,
        fats_grams: initialData.fats_grams,
        status: initialData.status,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
      });
    }
  }, [initialData]);

  const createMutation = useMutation({
    mutationFn: (data: DietPlanFormData) => createDietPlan(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diet plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      navigate('/diet-plans');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create diet plan",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DietPlanFormData> }) => updateDietPlan(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diet plan updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      navigate('/diet-plans');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update diet plan",
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData({ ...formData, [name]: formattedDate });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.title || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const dietPlanData: DietPlanFormData = {
      client_id: formData.client_id!,
      title: formData.title!,
      description: formData.description || '',
      daily_calories: formData.daily_calories || 0,
      protein_grams: formData.protein_grams || 0,
      carbs_grams: formData.carbs_grams || 0,
      fats_grams: formData.fats_grams || 0,
      status: formData.status || 'active',
      start_date: formData.start_date!,
      end_date: formData.end_date!
    };
    
    try {
      if (id) {
        await updateMutation.mutateAsync({ id: Number(id), data: formData });
      } else {
        await createMutation.mutateAsync(dietPlanData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/diet-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Diet Plans
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? 'Edit Diet Plan' : 'Create Diet Plan'}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Diet Plan' : 'Create New Diet Plan'}</CardTitle>
          <CardDescription>
            {id ? 'Update the diet plan details here.' : 'Enter the details for the new diet plan.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                type="number"
                id="client_id"
                name="client_id"
                value={formData.client_id || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="daily_calories">Daily Calories</Label>
                <Input
                  type="number"
                  id="daily_calories"
                  name="daily_calories"
                  value={formData.daily_calories || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="protein_grams">Protein (grams)</Label>
                <Input
                  type="number"
                  id="protein_grams"
                  name="protein_grams"
                  value={formData.protein_grams || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="carbs_grams">Carbs (grams)</Label>
                <Input
                  type="number"
                  id="carbs_grams"
                  name="carbs_grams"
                  value={formData.carbs_grams || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fats_grams">Fats (grams)</Label>
              <Input
                type="number"
                id="fats_grams"
                name="fats_grams"
                value={formData.fats_grams || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a status" defaultValue={formData.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.start_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(new Date(formData.start_date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => handleDateChange('start_date', date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.end_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(new Date(formData.end_date), 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={formData.end_date ? new Date(formData.end_date) : undefined}
                      onSelect={(date) => handleDateChange('end_date', date)}
                      disabled={(date) => date < new Date(formData.start_date || '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {id ? (updateMutation.isPending ? 'Updating...' : 'Update Diet Plan') : (createMutation.isPending ? 'Creating...' : 'Create Diet Plan')}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
