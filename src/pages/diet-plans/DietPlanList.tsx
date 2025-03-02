
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getDietPlans, deleteDietPlan } from '@/services/dietPlanService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Clipboard, CalendarRange, User, Gauge } from 'lucide-react';
import { DietPlan, DietPlanFilters } from '@/types/dietPlan';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DietPlanList() {
  const [filters, setFilters] = useState<DietPlanFilters>({
    status: 'active',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query diet plans
  const { data: dietPlans = [], isLoading } = useQuery({
    queryKey: ['diet-plans', filters],
    queryFn: () => getDietPlans(filters),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDietPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({
        title: 'Diet plan deleted',
        description: 'The diet plan has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Failed to delete diet plan:', error);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the diet plan.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      deleteMutation.mutate(id);
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    let colorClass = '';
    switch(status) {
      case 'active':
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'inactive':
        colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
        break;
      case 'completed':
        colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return (
      <Badge className={`${colorClass} px-3 py-1 capitalize`}>
        {status}
      </Badge>
    );
  };

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Diet Plans</h1>
        <Button asChild className="btn-gradient animate-pulse">
          <Link to="/diet-plans/new">
            <PlusCircle className="mr-2" />
            New Diet Plan
          </Link>
        </Button>
      </div>

      <Card className="card-gradient animate-fade-in">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter diet plans by client and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-64">
              <Input 
                placeholder="Client ID"
                type="number"
                value={filters.client_id || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  client_id: e.target.value ? Number(e.target.value) : undefined
                })}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={filters.status || ''}
                onValueChange={(value) => 
                  setFilters({
                    ...filters,
                    status: value as 'active' | 'inactive' | 'completed' | undefined
                  })
                }
              >
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Skeleton loading cards
          [...Array(6)].map((_, index) => (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : dietPlans.length === 0 ? (
          <div className="col-span-full py-8 text-center bg-muted/30 rounded-lg">
            <p className="text-lg font-medium text-muted-foreground">
              No diet plans found. Try adjusting your filters or create a new diet plan.
            </p>
            <Button asChild className="mt-4 btn-gradient">
              <Link to="/diet-plans/new">
                <PlusCircle className="mr-2" />
                Create Diet Plan
              </Link>
            </Button>
          </div>
        ) : (
          // Display diet plans as cards
          dietPlans.map((dietPlan: DietPlan) => (
            <Card 
              key={dietPlan.id} 
              className="overflow-hidden hover:-translate-y-1 transition-all duration-300 card-gradient border-gradient animate-scale-in shadow-soft hover:shadow-medium"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl truncate">{dietPlan.title}</CardTitle>
                  {renderStatusBadge(dietPlan.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {dietPlan.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">Client:</span>
                  <span>{dietPlan.client?.name || `ID: ${dietPlan.client_id}`}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Daily Calories:</span>
                  <span>{dietPlan.daily_calories} kcal</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <CalendarRange className="h-4 w-4 text-secondary" />
                  <span className="font-medium">Duration:</span>
                  <span>{formatDateRange(dietPlan.start_date, dietPlan.end_date)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    Protein: {dietPlan.macro_percentages?.protein || Math.round(dietPlan.protein_grams * 4 / dietPlan.daily_calories * 100)}%
                  </div>
                  <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    Carbs: {dietPlan.macro_percentages?.carbs || Math.round(dietPlan.carbs_grams * 4 / dietPlan.daily_calories * 100)}%
                  </div>
                  <div className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                    Fats: {dietPlan.macro_percentages?.fats || Math.round(dietPlan.fats_grams * 9 / dietPlan.daily_calories * 100)}%
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 flex justify-between gap-2 bg-muted/10">
                <Button variant="ghost" size="sm" className="flex-1 hover:bg-primary/10" onClick={() => navigate(`/diet-plans/${dietPlan.id}`)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 hover:bg-secondary/10"
                  onClick={() => navigate(`/diet-plans/${dietPlan.id}/meal-plans`)}
                >
                  <Clipboard className="h-4 w-4 mr-1" /> Meals
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 hover:bg-destructive/10"
                  onClick={() => handleDelete(dietPlan.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1 text-destructive" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
