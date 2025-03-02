
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDietPlanById } from '@/services/dietPlanService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, ChevronRight, Utensils } from 'lucide-react';
import { MealPlan } from '@/types/dietPlan';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function DietPlanMealPlans() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch diet plan details including meal plans
  const { data: dietPlan, isLoading } = useQuery({
    queryKey: ['diet-plan', id],
    queryFn: () => getDietPlanById(Number(id)),
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Helper function to capitalize the first letter of each word
  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Navigate to meal plan detail page
  const viewMealPlanDetails = (mealPlan: MealPlan) => {
    navigate(`/diet-plans/${id}/meal-plans/${mealPlan.day_of_week}`, { state: { mealPlan, dietPlan } });
  };

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

      <Card className="mb-4 animate-fade-in">
        <CardHeader>
          <CardTitle>Diet Plan Overview</CardTitle>
          <CardDescription>{dietPlan?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Client</p>
              <p className="font-medium">{dietPlan?.client?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <p className="font-medium">{dietPlan?.creator?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">
                {dietPlan?.start_date && dietPlan?.end_date ? (
                  <>
                    {format(new Date(dietPlan.start_date), 'MMM d, yyyy')} - {format(new Date(dietPlan.end_date), 'MMM d, yyyy')}
                  </>
                ) : (
                  'Not specified'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={dietPlan?.status === 'active' ? 'default' : dietPlan?.status === 'completed' ? 'success' : 'secondary'}>
                {dietPlan?.status}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="text-2xl font-bold">{dietPlan?.daily_calories}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold">{dietPlan?.protein_grams}g</p>
                  {dietPlan?.macro_percentages && (
                    <p className="text-sm text-muted-foreground">{dietPlan?.macro_percentages.protein}%</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold">{dietPlan?.carbs_grams}g</p>
                  {dietPlan?.macro_percentages && (
                    <p className="text-sm text-muted-foreground">{dietPlan?.macro_percentages.carbs}%</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {dietPlan?.meal_plans && dietPlan.meal_plans.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dietPlan.meal_plans
            .sort((a, b) => {
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
            })
            .map((mealPlan: MealPlan, index) => (
              <Card 
                key={mealPlan.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
                onClick={() => viewMealPlanDetails(mealPlan)}
              >
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{capitalizeDay(mealPlan.day_of_week)}</CardTitle>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="font-medium">Calories</div>
                      <div className="text-lg">{mealPlan.total_calories}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="font-medium">Protein</div>
                      <div className="text-lg">{mealPlan.total_protein}g</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="font-medium">Carbs</div>
                      <div className="text-lg">{mealPlan.total_carbs}g</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{mealPlan.meals?.length || 0} meals planned</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t text-sm p-3 flex justify-between">
                  <span>View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-medium mb-2">No Meal Plans Found</p>
            <p className="text-muted-foreground text-center max-w-md">
              This diet plan doesn't have any meal plans associated with it yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
