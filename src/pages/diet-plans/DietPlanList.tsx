
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getDietPlans, deleteDietPlan } from '@/services/dietPlanService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Clipboard, CalendarRange } from 'lucide-react';
import { DietPlan, DietPlanFilters } from '@/types/dietPlan';

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Diet Plans</h1>
        <Button asChild>
          <Link to="/diet-plans/new">
            <PlusCircle className="mr-2" />
            New Diet Plan
          </Link>
        </Button>
      </div>

      <Card>
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
                <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>Diet Plans</CardTitle>
          <CardDescription>Manage your clients' diet plans</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading diet plans...</div>
          ) : dietPlans.length === 0 ? (
            <div className="py-4 text-center">No diet plans found. Try adjusting your filters or create a new diet plan.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Daily Calories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dietPlans.map((dietPlan: DietPlan) => (
                    <TableRow key={dietPlan.id}>
                      <TableCell className="font-medium">{dietPlan.title}</TableCell>
                      <TableCell>{dietPlan.client_id}</TableCell>
                      <TableCell>{dietPlan.daily_calories} kcal</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${dietPlan.status === 'active' ? 'bg-green-100 text-green-800' : 
                            dietPlan.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {dietPlan.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarRange className="h-4 w-4 mr-1 text-gray-500" />
                          {format(new Date(dietPlan.start_date), 'MMM d, yyyy')} - {format(new Date(dietPlan.end_date), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/diet-plans/${dietPlan.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/diet-plans/${dietPlan.id}/meal-plans`)}
                          >
                            <Clipboard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dietPlan.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
