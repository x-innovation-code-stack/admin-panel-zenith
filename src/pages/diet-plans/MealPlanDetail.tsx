
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

  // Define meal type colors
  const mealTypeColors: Record<string, string> = {
    breakfast: 'bg-gradient-to-r from-[#FEF7CD] to-[#F2FCE2] text-foreground',
    morning_snack: 'bg-gradient-to-r from-[#E5DEFF] to-[#FFDEE2] text-foreground',
    lunch: 'bg-gradient-to-r from-[#D946EF]/10 to-[#8B5CF6]/10 text-foreground',
    afternoon_snack: 'bg-gradient-to-r from-[#FFDEE2] to-[#FEF7CD] text-foreground',
    dinner: 'bg-gradient-to-r from-[#F2FCE2] to-[#E5DEFF] text-foreground',
    evening_snack: 'bg-gradient-to-r from-[#E5DEFF] to-[#FFDEE2] text-foreground'
  };

  const renderMealRows = (meals: Meal[]) => {
    return meals
      .sort((a, b) => new Date(a.time_of_day).getTime() - new Date(b.time_of_day).getTime())
      .map((meal, index) => {
        const mealColor = mealTypeColors[meal.meal_type] || 'bg-muted';
        
        return (
          <Card 
            key={meal.id} 
            className="mb-4 animate-fade-in shadow-medium overflow-hidden hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardHeader className={`pb-2 ${mealColor}`}>
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="mb-2 shadow-soft">{meal.meal_type_display}</Badge>
                  <CardTitle className="text-lg">{meal.title}</CardTitle>
                </div>
                <div className="flex items-center text-muted-foreground bg-white/70 px-2 py-1 rounded-full shadow-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(meal.time_of_day)}
                </div>
              </div>
              <CardDescription>{meal.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center p-2 bg-gradient-to-br from-white to-[#FEF7CD]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 150 + 100}ms` }}>
                  <div className="font-medium text-primary">Calories</div>
                  <div className="text-lg font-bold">{meal.calories}</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-white to-[#E5DEFF]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 150 + 150}ms` }}>
                  <div className="font-medium text-secondary">Protein</div>
                  <div className="text-lg font-bold">{meal.protein_grams}g</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-br from-white to-[#FFDEE2]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: `${index * 150 + 200}ms` }}>
                  <div className="font-medium text-destructive">Carbs</div>
                  <div className="text-lg font-bold">{meal.carbs_grams}g</div>
                </div>
              </div>
              
              {meal.recipes && meal.recipes.length > 0 && (
                <div className="mt-6 animate-scale-in bg-gradient-to-br from-white to-accent/20 p-4 rounded-lg shadow-soft" style={{ animationDelay: `${index * 150 + 250}ms` }}>
                  <h4 className="font-semibold mb-3 text-gradient">Recipe: {meal.recipes[0].name}</h4>
                  <div className="mb-3 animate-fade-in" style={{ animationDelay: `${index * 150 + 300}ms` }}>
                    <h5 className="text-sm font-medium mb-2 text-secondary">Ingredients:</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {meal.recipes[0].ingredients.map((ingredient, i) => (
                        <li key={i} className="animate-fade-in" style={{ animationDelay: `${index * 150 + 350 + i * 50}ms` }}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: `${index * 150 + 400}ms` }}>
                    <h5 className="text-sm font-medium mb-2 text-secondary">Instructions:</h5>
                    <p className="text-sm">{meal.recipes[0].instructions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      });
  };

  // Choose a background color based on the day of the week
  const dayColors: Record<string, string> = {
    monday: 'from-[#F2FCE2] to-[#E5DEFF]',
    tuesday: 'from-[#E5DEFF] to-[#FFDEE2]',
    wednesday: 'from-[#FFDEE2] to-[#FEF7CD]',
    thursday: 'from-[#FEF7CD] to-[#F2FCE2]',
    friday: 'from-[#E5DEFF] to-[#F2FCE2]',
    saturday: 'from-[#FFDEE2] to-[#E5DEFF]',
    sunday: 'from-[#FEF7CD] to-[#FFDEE2]',
  };
  const bgGradient = day ? dayColors[day] || 'from-white to-accent/40' : 'from-white to-accent/40';

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild className="shadow-soft hover:shadow-md transition-all duration-300">
          <Link to={`/diet-plans/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Diet Plan
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-gradient animate-fade-in">
          {capitalizeDay(mealPlan.day_of_week)} Meal Plan
        </h1>
      </div>

      <Card className="mb-6 animate-fade-in shadow-medium overflow-hidden bg-gradient-to-br from-white to-accent/40">
        <CardHeader className={`bg-gradient-to-r ${bgGradient}`}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary">{dietPlan.title}</CardTitle>
            <Badge variant={dietPlan.status === 'active' ? 'default' : dietPlan.status === 'completed' ? 'success' : 'secondary'}>
              {dietPlan.status}
            </Badge>
          </div>
          <CardDescription>{dietPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-white to-[#FEF7CD]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: "100ms" }}>
              <div className="font-medium text-primary">Total Calories</div>
              <div className="text-2xl font-bold">{mealPlan.total_calories}</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-white to-[#E5DEFF]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: "150ms" }}>
              <div className="font-medium text-secondary">Total Protein</div>
              <div className="text-2xl font-bold">{mealPlan.total_protein}g</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-white to-[#FFDEE2]/30 rounded-md shadow-soft animate-scale-in" style={{ animationDelay: "200ms" }}>
              <div className="font-medium text-destructive">Total Carbs</div>
              <div className="text-2xl font-bold">{mealPlan.total_carbs}g</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4 animate-fade-in text-gradient">Meals</h2>
        {mealPlan.meals && mealPlan.meals.length > 0 ? (
          <div>{renderMealRows(mealPlan.meals)}</div>
        ) : (
          <Card className="animate-fade-in shadow-medium bg-gradient-to-r from-white to-accent/40">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No meals found for this day.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
