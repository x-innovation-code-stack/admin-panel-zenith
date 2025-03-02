
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDietPlanById, getDietPlanMealPlans } from '@/services/dietPlanService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DietPlanMealPlans() {
  const { id } = useParams();
  
  // Fetch diet plan details
  const { data: dietPlan, isLoading: isLoadingDietPlan } = useQuery({
    queryKey: ['diet-plan', id],
    queryFn: () => getDietPlanById(Number(id)),
  });
  
  // Fetch meal plans for this diet plan
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery({
    queryKey: ['diet-plan-meal-plans', id],
    queryFn: () => getDietPlanMealPlans(Number(id)),
    enabled: !!id,
  });
  
  const isLoading = isLoadingDietPlan || isLoadingMealPlans;
  
  if (isLoading) {
    return <div className="container mx-auto py-6">Loading meal plans...</div>;
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
          Meal Plans for {dietPlan?.title}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Meal Plans</CardTitle>
          <CardDescription>
            View meal plans for this diet plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mealPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meal plans found for this diet plan.</p>
              <p className="text-sm text-muted-foreground">
                Once the API for meal plans is implemented, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Render meal plans when the API is implemented */}
              {mealPlans.map((mealPlan: any) => (
                <Card key={mealPlan.id}>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium">{mealPlan.title}</h3>
                    <p className="text-sm text-muted-foreground">{mealPlan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
