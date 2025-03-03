
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMealPlan } from "@/services/dietPlanService";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteMealPlanDialogProps = {
  dietPlanId: number;
  mealPlanId: number;
  dayOfWeek: string;
};

export default function DeleteMealPlanDialog({ dietPlanId, mealPlanId, dayOfWeek }: DeleteMealPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const deleteMealPlanMutation = useMutation({
    mutationFn: () => deleteMealPlan(dietPlanId, mealPlanId),
    onSuccess: () => {
      toast.success("Meal plan deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["diet-plan", dietPlanId],
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete meal plan";
      toast.error(message);
    },
  });

  // Helper function to capitalize the day of week
  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-br from-white to-red-50">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the {capitalizeDay(dayOfWeek)} meal plan? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteMealPlanMutation.mutate();
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            {deleteMealPlanMutation.isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
