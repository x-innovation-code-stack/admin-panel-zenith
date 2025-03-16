
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientProfile, createOrUpdateClientProfile, updateClientProfile } from "@/services/profileService";
import { getUserById } from "@/services/userService";
import {
  CreateProfileData,
  UpdateProfileData,
  ActivityLevel,
  DietType,
  Gender,
  StressSleep,
  MealTiming,
  ExerciseRoutine,
  BodyType,
  WaterIntake,
  WeightGoal
} from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  User,
} from "lucide-react";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise",
  },
  {
    value: "lightly_active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    value: "moderately_active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    value: "very_active",
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
  },
  {
    value: "extremely_active",
    label: "Extremely Active",
    description: "Very hard exercise, physical job or training twice a day",
  },
];

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: "standard", label: "Standard (No Restrictions)" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Ketogenic" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

const STRESS_SLEEP_OPTIONS: { value: StressSleep; label: string }[] = [
  { value: "low_good", label: "Low Stress / Good Sleep" },
  { value: "moderate_ok", label: "Moderate Stress / OK Sleep" },
  { value: "high_enough", label: "High Stress / Enough Sleep" },
  { value: "low_poor", label: "Low Stress / Poor Sleep" },
  { value: "high_poor", label: "High Stress / Poor Sleep" },
];

const MEAL_TIMING_OPTIONS: { value: MealTiming; label: string }[] = [
  { value: "traditional_meals", label: "Traditional 3 Meals" },
  { value: "small_frequent", label: "Small Frequent Meals" },
  { value: "intermittent_16_8", label: "Intermittent Fasting 16:8" },
  { value: "intermittent_18_6", label: "Intermittent Fasting 18:6" },
  { value: "omad", label: "One Meal a Day" },
  { value: "flexible_pattern", label: "Flexible Eating Pattern" },
];

const EXERCISE_ROUTINE_OPTIONS: { value: ExerciseRoutine; label: string }[] = [
  { value: "strength", label: "Strength Training" },
  { value: "cardio", label: "Cardio Focused" },
  { value: "mix_exercise", label: "Mixed Exercise" },
  { value: "yoga", label: "Yoga & Flexibility" },
  { value: "sport", label: "Sports Based" },
  { value: "minimal_ex", label: "Minimal Exercise" },
];

const BODY_TYPE_OPTIONS: { value: BodyType; label: string }[] = [
  { value: "ectomorph", label: "Ectomorph (Naturally Thin)" },
  { value: "mesomorph", label: "Mesomorph (Athletic Build)" },
  { value: "endomorph", label: "Endomorph (Naturally Heavier)" },
  { value: "combination", label: "Combination" },
  { value: "not_sure", label: "Not Sure" },
];

const WATER_INTAKE_OPTIONS: { value: WaterIntake; label: string }[] = [
  { value: "water_lt1", label: "Less than 1 liter daily" },
  { value: "water_1to2", label: "1-2 liters daily" },
  { value: "water_2to3", label: "2-3 liters daily" },
  { value: "water_gt3", label: "More than 3 liters daily" },
  { value: "water_unknown", label: "Not tracking water intake" },
];

const WEIGHT_GOAL_OPTIONS: { value: WeightGoal; label: string }[] = [
  { value: "rapid_loss", label: "Rapid Weight Loss" },
  { value: "moderate_loss", label: "Moderate Weight Loss" },
  { value: "slow_loss", label: "Slow Weight Loss" },
  { value: "maintain", label: "Maintain Current Weight" },
  { value: "slight_gain", label: "Slight Weight Gain" },
  { value: "moderate_gain", label: "Moderate Weight Gain" },
  { value: "significant_gain", label: "Significant Weight Gain" },
];

const HEALTH_CONDITIONS = [
  { value: "none", label: "None" },
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension" },
  { value: "heart_disease", label: "Heart Disease" },
  { value: "high_cholesterol", label: "High Cholesterol" },
  { value: "thyroid", label: "Thyroid Issues" },
  { value: "arthritis", label: "Arthritis" },
  { value: "digestive_disorder", label: "Digestive Disorder" },
];

const ALLERGIES = [
  { value: "none", label: "None" },
  { value: "gluten", label: "Gluten" },
  { value: "dairy", label: "Dairy" },
  { value: "nuts", label: "Nuts" },
  { value: "soy", label: "Soy" },
  { value: "shellfish", label: "Shellfish" },
  { value: "eggs", label: "Eggs" },
  { value: "fish", label: "Fish" },
];

const RECOVERY_NEEDS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "performance", label: "Performance Improvement" },
  { value: "injury_recovery", label: "Injury Recovery" },
  { value: "energy", label: "Energy Enhancement" },
  { value: "stress_reduction", label: "Stress Reduction" },
  { value: "sleep_improvement", label: "Sleep Improvement" },
];

const MEAL_PREFERENCES = [
  { value: "high_protein", label: "High Protein" },
  { value: "low_carb", label: "Low Carb" },
  { value: "high_carb", label: "High Carb" },
  { value: "low_fat", label: "Low Fat" },
  { value: "low_calorie", label: "Low Calorie" },
  { value: "fasting", label: "Intermittent Fasting" },
  { value: "small_frequent", label: "Small Frequent Meals" },
];

const PLAN_TYPE_OPTIONS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_health", label: "General Health" },
  { value: "athletic_performance", label: "Athletic Performance" },
  { value: "specialized", label: "Specialized Diet" },
];

// Updated schema to include all required fields
const profileSchema = z.object({
  age: z
    .number()
    .min(18, { message: "Age must be at least 18" })
    .max(100, { message: "Age must be at most 100" }),
  gender: z.enum(["male", "female", "other"] as const),
  height: z
    .number()
    .min(100, { message: "Height must be at least 100 cm" })
    .max(250, { message: "Height must be at most 250 cm" }),
  current_weight: z
    .number()
    .min(30, { message: "Weight must be at least 30 kg" })
    .max(300, { message: "Weight must be at most 300 kg" }),
  target_weight: z
    .number()
    .min(30, { message: "Weight must be at least 30 kg" })
    .max(300, { message: "Weight must be at most 300 kg" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  activity_level: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extremely_active",
  ] as const),
  diet_type: z.enum([
    "standard",
    "vegetarian",
    "vegan",
    "pescatarian",
    "keto",
    "paleo",
    "mediterranean",
  ] as const),
  health_conditions: z.array(z.string()),
  allergies: z.array(z.string()),
  recovery_needs: z.array(z.string()),
  meal_preferences: z.array(z.string()),
  stress_sleep: z.enum([
    "low_good", 
    "moderate_ok", 
    "high_enough", 
    "low_poor", 
    "high_poor"
  ] as const).optional(),
  meal_timing: z.enum([
    "traditional_meals", 
    "small_frequent", 
    "intermittent_16_8", 
    "intermittent_18_6", 
    "omad", 
    "flexible_pattern"
  ] as const).optional(),
  exercise_routine: z.enum([
    "strength", 
    "cardio", 
    "mix_exercise", 
    "yoga", 
    "sport", 
    "minimal_ex"
  ] as const).optional(),
  body_type: z.enum([
    "ectomorph", 
    "mesomorph", 
    "endomorph", 
    "combination", 
    "not_sure"
  ] as const).optional(),
  water_intake: z.enum([
    "water_lt1", 
    "water_1to2", 
    "water_2to3", 
    "water_gt3", 
    "water_unknown"
  ] as const).optional(),
  weight_goal: z.enum([
    "rapid_loss", 
    "moderate_loss", 
    "slow_loss", 
    "maintain", 
    "slight_gain", 
    "moderate_gain", 
    "significant_gain"
  ] as const).optional(),
  plan_type: z.string().min(1, { message: "Plan type is required" }),
});

type FormData = z.infer<typeof profileSchema>;

const ClientProfileForm = () => {
  const { id } = useParams();
  const userId = id ? parseInt(id) : 0;
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basics: true,
    dietary: true,
    health: true,
    goals: true,
    location: true,
    advanced: false,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data to display name
  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  // Form setup with empty initial values but ensures arrays are initialized properly
  const form = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 0,
      gender: "male",
      height: 0,
      current_weight: 0,
      target_weight: 0,
      country: "",
      state: "",
      city: "",
      activity_level: "moderately_active",
      diet_type: "standard",
      health_conditions: [],
      allergies: [],
      recovery_needs: [],
      meal_preferences: [],
      plan_type: "weight_loss",
    },
    mode: "onChange",
  });

  // Fetch client profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["client-profile", userId],
    queryFn: () => getClientProfile(userId),
    enabled: !!userId,
  });

  // Initialize form with data
  useEffect(() => {
    if (!formInitialized && !isProfileLoading) {
      if (profileData) {
        setIsUpdateMode(true);
        form.reset({
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          current_weight: profileData.current_weight,
          target_weight: profileData.target_weight,
          country: profileData.country,
          state: profileData.state,
          city: profileData.city,
          activity_level: profileData.activity_level,
          diet_type: profileData.diet_type,
          health_conditions: Array.isArray(profileData.health_conditions)
            ? profileData.health_conditions
            : [],
          allergies: Array.isArray(profileData.allergies)
            ? profileData.allergies
            : [],
          recovery_needs: Array.isArray(profileData.recovery_needs)
            ? profileData.recovery_needs
            : [],
          meal_preferences: Array.isArray(profileData.meal_preferences)
            ? profileData.meal_preferences
            : [],
          stress_sleep: profileData.stress_sleep,
          meal_timing: profileData.meal_timing,
          exercise_routine: profileData.exercise_routine,
          body_type: profileData.body_type,
          water_intake: profileData.water_intake,
          weight_goal: profileData.weight_goal,
          plan_type: profileData.plan_type_display || "weight_loss",
        });
      } else {
        // Only for new profiles - initialize with reasonable defaults
        form.reset({
          age: 30,
          gender: "male",
          height: 170,
          current_weight: 70,
          target_weight: 70,
          country: "",
          state: "",
          city: "",
          activity_level: "moderately_active",
          diet_type: "standard",
          health_conditions: ["none"],
          allergies: ["none"],
          recovery_needs: [],
          meal_preferences: [],
          plan_type: "weight_loss",
        });
      }
      setFormInitialized(true);
    }
  }, [profileData, isProfileLoading, form, formInitialized]);

  // Create or update profile mutation
  const createOrUpdateProfileMutation = useMutation({
    mutationFn: (data: CreateProfileData) =>
      createOrUpdateClientProfile(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: isUpdateMode
          ? "Profile updated successfully"
          : "Profile created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["client-profile", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save profile",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) =>
      updateClientProfile(userId, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["client-profile", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Check if user has modified the form (to avoid submitting default values)
    const hasUserChangedForm = form.formState.isDirty || isUpdateMode;

    if (!hasUserChangedForm && !isUpdateMode) {
      toast({
        title: "Warning",
        description: "Please update the profile data before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Ensure all array fields are initialized
    const safeData = {
      ...data,
      health_conditions: Array.isArray(data.health_conditions)
        ? data.health_conditions
        : [],
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
      recovery_needs: Array.isArray(data.recovery_needs)
        ? data.recovery_needs
        : [],
      meal_preferences: Array.isArray(data.meal_preferences)
        ? data.meal_preferences
        : [],
    };

    if (isUpdateMode) {
      updateProfileMutation.mutate(safeData);
    } else {
      createOrUpdateProfileMutation.mutate(safeData);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Safe handler for checkboxes
  const handleCheckboxChange = (
    field: { value: string[]; onChange: (value: string[]) => void },
    itemValue: string,
    checked: boolean,
    isExclusive: boolean = false
  ) => {
    // Ensure field.value is an array
    const currentValues = Array.isArray(field.value) ? field.value : [];

    if (isExclusive && itemValue === "none") {
      // If 'none' is selected, clear other values
      field.onChange(checked ? ["none"] : []);
    } else if (isExclusive) {
      // If another value is selected, remove 'none'
      const newValues = checked
        ? [...currentValues.filter((v) => v !== "none"), itemValue]
        : currentValues.filter((v) => v !== itemValue);

      field.onChange(newValues);
    } else {
      // Normal case - toggle the value
      const newValues = checked
        ? [...currentValues, itemValue]
        : currentValues.filter((v) => v !== itemValue);

      field.onChange(newValues);
    }
  };

  const isLoading =
    isProfileLoading ||
    createOrUpdateProfileMutation.isPending ||
    updateProfileMutation.isPending ||
    !formInitialized;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/users")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Client Profile</h1>
            <p className="text-muted-foreground">
              {userData
                ? `Managing profile for ${userData.name}`
                : "Loading user details..."}
            </p>
          </div>
        </div>
      </div>

      <Card className="glass card-gradient border-0 shadow-medium max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-gradient flex items-center">
            <User className="mr-2 h-5 w-5" />
            Client Health & Fitness Profile
          </CardTitle>
          <CardDescription>
            {isUpdateMode
              ? "Update the client profile information below"
              : "Fill in the details to create a new client profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Collapsible
                  open={openSections.basics}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("basics")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Basic Information
                      </span>
                      {openSections.basics ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (years)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="bg-white/70"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {GENDERS.map((gender) => (
                                  <SelectItem
                                    key={gender.value}
                                    value={gender.value}
                                  >
                                    {gender.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                className="bg-white/70"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="current_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                step="0.1"
                                className="bg-white/70"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="target_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                step="0.1"
                                className="bg-white/70"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="activity_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select activity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ACTIVITY_LEVELS.map((level) => (
                                  <SelectItem
                                    key={level.value}
                                    value={level.value}
                                  >
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {
                                ACTIVITY_LEVELS.find(
                                  (level) => level.value === field.value
                                )?.description
                              }
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight_goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight Goal</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select weight goal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {WEIGHT_GOAL_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.location}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("location")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Location Information
                      </span>
                      {openSections.location ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/70"
                                placeholder="Enter country"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/70"
                                placeholder="Enter state or province"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/70"
                                placeholder="Enter city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.dietary}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("dietary")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Dietary Preferences
                      </span>
                      {openSections.dietary ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="diet_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diet Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select diet type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DIET_TYPES.map((diet) => (
                                  <SelectItem
                                    key={diet.value}
                                    value={diet.value}
                                  >
                                    {diet.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meal_timing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Timing Preference</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select meal timing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MEAL_TIMING_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meal_preferences"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Preferences</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                              {MEAL_PREFERENCES.map((preference) => (
                                <FormItem
                                  key={preference.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(preference.value)
                                      }
                                      onCheckedChange={(checked) => {
                                        handleCheckboxChange(
                                          field,
                                          preference.value,
                                          !!checked
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {preference.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.health}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("health")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Health Information
                      </span>
                      {openSections.health ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="health_conditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Health Conditions</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                              {HEALTH_CONDITIONS.map((condition) => (
                                <FormItem
                                  key={condition.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(condition.value)
                                      }
                                      onCheckedChange={(checked) => {
                                        handleCheckboxChange(
                                          field,
                                          condition.value,
                                          !!checked,
                                          true
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {condition.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies & Intolerances</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                              {ALLERGIES.map((allergy) => (
                                <FormItem
                                  key={allergy.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(allergy.value)
                                      }
                                      onCheckedChange={(checked) => {
                                        handleCheckboxChange(
                                          field,
                                          allergy.value,
                                          !!checked,
                                          true
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {allergy.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stress_sleep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stress & Sleep Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select stress & sleep status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STRESS_SLEEP_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.goals}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("goals")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Fitness Goals
                      </span>
                      {openSections.goals ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="recovery_needs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recovery & Wellness Needs</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                              {RECOVERY_NEEDS.map((need) => (
                                <FormItem
                                  key={need.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={
                                        Array.isArray(field.value) &&
                                        field.value.includes(need.value)
                                      }
                                      onCheckedChange={(checked) => {
                                        handleCheckboxChange(
                                          field,
                                          need.value,
                                          !!checked
                                        );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {need.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="exercise_routine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exercise Routine</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select exercise routine" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EXERCISE_ROUTINE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="plan_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select plan type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PLAN_TYPE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible
                  open={openSections.advanced}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection("advanced")}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">
                        Advanced Settings
                      </span>
                      {openSections.advanced ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-2">
                    <div className="space-y-6 pt-4">
                      <FormField
                        control={form.control}
                        name="body_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select body type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BODY_TYPE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="water_intake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water Intake</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/70">
                                  <SelectValue placeholder="Select water intake" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {WATER_INTAKE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/users")}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-gradient shadow-soft"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUpdateMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdateMode ? "Update Profile" : "Create Profile"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ClientProfileForm;
