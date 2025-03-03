
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDietPlanById } from '@/services/dietPlanService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, ChevronRight, Utensils, Trash2 } from 'lucide-react';
import { MealPlan } from '@/types/dietPlan';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import CreateMealPlanDialog from '@/components/diet-plans/CreateMealPlanDialog';
import DeleteMealPlanDialog from '@/components/diet-plans/DeleteMealPlanDialog';

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
      <div className="flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="shadow-soft hover:shadow-md transition-all duration-300">
            <Link to="/diet-plans">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Diet Plans
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            Meal Plans for {dietPlan?.title}
          </h1>
        </div>
        <CreateMealPlanDialog dietPlanId={Number(id)} />
      </div>

      <Card className="mb-4 animate-fade-in shadow-medium border-gradient overflow-hidden bg-gradient-to-r from-white to-accent/40">
        <CardHeader className="bg-gradient-to-r from-[#F2FCE2]/50 to-[#E5DEFF]/50">
          <CardTitle className="text-primary">{dietPlan?.title}</CardTitle>
          <CardDescription>{dietPlan?.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
              <p className="text-sm text-muted-foreground mb-1">Client</p>
              <p className="font-medium">{dietPlan?.client?.name}</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <p className="font-medium">{dietPlan?.creator?.name}</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
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
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={dietPlan?.status === 'active' ? 'default' : dietPlan?.status === 'completed' ? 'success' : 'secondary'}>
                {dietPlan?.status}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card className="animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "250ms" }}>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-[#FEF7CD]/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="text-2xl font-bold text-primary">{dietPlan?.daily_calories}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "300ms" }}>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-[#E5DEFF]/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold text-secondary">{dietPlan?.protein_grams}g</p>
                  {dietPlan?.macro_percentages && (
                    <p className="text-sm text-muted-foreground">{dietPlan?.macro_percentages.protein}%</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "350ms" }}>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-[#FFDEE2]/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold text-destructive">{dietPlan?.carbs_grams}g</p>
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
            .map((mealPlan: MealPlan, index) => {
              // Choose a background color based on the day of the week
              const dayColors = {
                monday: 'from-[#F2FCE2] to-[#E5DEFF]',
                tuesday: 'from-[#E5DEFF] to-[#FFDEE2]',
                wednesday: 'from-[#FFDEE2] to-[#FEF7CD]',
                thursday: 'from-[#FEF7CD] to-[#F2FCE2]',
                friday: 'from-[#E5DEFF] to-[#F2FCE2]',
                saturday: 'from-[#FFDEE2] to-[#E5DEFF]',
                sunday: 'from-[#FEF7CD] to-[#FFDEE2]',
              };
              const bgGradient = dayColors[mealPlan.day_of_week as keyof typeof dayColors] || 'from-white to-accent/40';
              
              return (
                <Card 
                  key={mealPlan.id} 
                  className={`overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.03] animate-fade-in shadow-soft bg-gradient-to-br ${bgGradient}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="relative">
                    <div className="flex justify-between items-center relative z-10">
                      <CardTitle className="text-xl font-bold">{capitalizeDay(mealPlan.day_of_week)}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <DeleteMealPlanDialog 
                          dietPlanId={Number(id)} 
                          mealPlanId={mealPlan.id} 
                          dayOfWeek={mealPlan.day_of_week} 
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => viewMealPlanDetails(mealPlan)}>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 cursor-pointer" onClick={() => viewMealPlanDetails(mealPlan)}>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                      <div className="text-center p-2 bg-white/60 backdrop-blur-sm rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 100 + 100}ms` }}>
                        <div className="font-medium text-primary">Calories</div>
                        <div className="text-lg font-bold">{mealPlan.total_calories}</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 backdrop-blur-sm rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 100 + 150}ms` }}>
                        <div className="font-medium text-secondary">Protein</div>
                        <div className="text-lg font-bold">{mealPlan.total_protein}g</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 backdrop-blur-sm rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                        <div className="font-medium text-destructive">Carbs</div>
                        <div className="text-lg font-bold">{mealPlan.total_carbs}g</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: `${index * 100 + 250}ms` }}>
                      <p>{mealPlan.meals?.length || 0} meals planned</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-white/30 backdrop-blur-sm border-t text-sm p-3 flex justify-between animate-fade-in cursor-pointer" onClick={() => viewMealPlanDetails(mealPlan)} style={{ animationDelay: `${index * 100 + 300}ms` }}>
                    <span className="font-medium">View Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card className="animate-fade-in shadow-medium bg-gradient-to-r from-white to-accent/40">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mb-4 animate-float" />
            <p className="text-xl font-medium mb-2 text-gradient">No Meal Plans Found</p>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              This diet plan doesn't have any meal plans associated with it yet.
            </p>
            <CreateMealPlanDialog dietPlanId={Number(id)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
