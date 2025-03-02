
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Meal, MealPlan, DietPlan } from '@/types/dietPlan';

export default function MealPlanDetail() {
  const { id, day } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { mealPlan, dietPlan } = location.state as { mealPlan: MealPlan, dietPlan: DietPlan };

  // If there's no state, navigate back
  if (!mealPlan || !dietPlan) {
    navigate(`/diet-plans/${id}`);
    return null;
  }

  // Helper function to capitalize the day of week
  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Helper function to format the time
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };

  const renderMealRows = (meals: Meal[]) => {
    return meals
      .sort((a, b) => new Date(a.time_of_day).getTime() - new Date(b.time_of_day).getTime())
      .map((meal, index) => (
        <Card 
          key={meal.id} 
          className="mb-4 animate-fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <Badge className="mb-2">{meal.meal_type_display}</Badge>
                <CardTitle className="text-lg">{meal.title}</CardTitle>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(meal.time_of_day)}
              </div>
            </div>
            <CardDescription>{meal.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div className="text-center p-2 bg-muted rounded-md">
                <div className="font-medium">Calories</div>
                <div className="text-lg">{meal.calories}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-md">
                <div className="font-medium">Protein</div>
                <div className="text-lg">{meal.protein_grams}g</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-md">
                <div className="font-medium">Carbs</div>
                <div className="text-lg">{meal.carbs_grams}g</div>
              </div>
            </div>
            
            {meal.recipes && meal.recipes.length > 0 && (
              <div className="mt-4 animate-scale-in">
                <h4 className="font-semibold mb-2">Recipe: {meal.recipes[0].name}</h4>
                <div className="mb-2">
                  <h5 className="text-sm font-medium mb-1">Ingredients:</h5>
                  <ul className="list-disc pl-5 text-sm">
                    {meal.recipes[0].ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-1">Instructions:</h5>
                  <p className="text-sm">{meal.recipes[0].instructions}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/diet-plans/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Diet Plan
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
          {capitalizeDay(mealPlan.day_of_week)} Meal Plan
        </h1>
      </div>

      <Card className="mb-6 animate-fade-in">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            <CardTitle>{dietPlan.title}</CardTitle>
            <Badge variant={dietPlan.status === 'active' ? 'default' : dietPlan.status === 'completed' ? 'success' : 'secondary'}>
              {dietPlan.status}
            </Badge>
          </div>
          <CardDescription>{dietPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="font-medium">Total Calories</div>
              <div className="text-2xl font-bold">{mealPlan.total_calories}</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="font-medium">Total Protein</div>
              <div className="text-2xl font-bold">{mealPlan.total_protein}g</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="font-medium">Total Carbs</div>
              <div className="text-2xl font-bold">{mealPlan.total_carbs}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4 animate-fade-in">Meals</h2>
        {mealPlan.meals && mealPlan.meals.length > 0 ? (
          <div>{renderMealRows(mealPlan.meals)}</div>
        ) : (
          <Card className="animate-fade-in">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No meals found for this day.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
