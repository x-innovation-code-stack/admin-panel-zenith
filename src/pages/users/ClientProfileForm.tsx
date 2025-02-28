
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import profileService from '@/services/profileService';
import userService from '@/services/userService';
import { CreateProfileData, UpdateProfileData, ActivityLevel, DietType, Gender } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Save, User } from 'lucide-react';

// Define available options
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job or training twice a day' },
];

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: 'standard', label: 'Standard (No Restrictions)' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Ketogenic' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
];

const HEALTH_CONDITIONS = [
  { value: 'none', label: 'None' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'high_cholesterol', label: 'High Cholesterol' },
  { value: 'thyroid', label: 'Thyroid Issues' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'digestive_disorder', label: 'Digestive Disorder' },
];

const ALLERGIES = [
  { value: 'none', label: 'None' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fish', label: 'Fish' },
];

const RECOVERY_NEEDS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'performance', label: 'Performance Improvement' },
  { value: 'injury_recovery', label: 'Injury Recovery' },
  { value: 'energy', label: 'Energy Enhancement' },
  { value: 'stress_reduction', label: 'Stress Reduction' },
  { value: 'sleep_improvement', label: 'Sleep Improvement' },
];

const MEAL_PREFERENCES = [
  { value: 'high_protein', label: 'High Protein' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'high_carb', label: 'High Carb' },
  { value: 'low_fat', label: 'Low Fat' },
  { value: 'low_calorie', label: 'Low Calorie' },
  { value: 'fasting', label: 'Intermittent Fasting' },
  { value: 'small_frequent', label: 'Small Frequent Meals' },
];

// Form schema with validation
const profileSchema = z.object({
  age: z.number().min(18, { message: 'Age must be at least 18' }).max(100, { message: 'Age must be at most 100' }),
  gender: z.enum(['male', 'female', 'other'] as const),
  height: z.number().min(100, { message: 'Height must be at least 100 cm' }).max(250, { message: 'Height must be at most 250 cm' }),
  current_weight: z.number().min(30, { message: 'Weight must be at least 30 kg' }).max(300, { message: 'Weight must be at most 300 kg' }),
  target_weight: z.number().min(30, { message: 'Weight must be at least 30 kg' }).max(300, { message: 'Weight must be at most 300 kg' }),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as const),
  diet_type: z.enum(['standard', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean'] as const),
  health_conditions: z.array(z.string()),
  allergies: z.array(z.string()),
  recovery_needs: z.array(z.string()),
  meal_preferences: z.array(z.string()),
});

type FormData = z.infer<typeof profileSchema>;

const ClientProfileForm = () => {
  const { id } = useParams();
  const userId = id ? parseInt(id) : 0;
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basics: true,
    dietary: true,
    health: true,
    goals: true,
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data to display name
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });

  // Form setup with default values
  const form = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 30,
      gender: 'male',
      height: 170,
      current_weight: 70,
      target_weight: 70,
      activity_level: 'moderately_active',
      diet_type: 'standard',
      health_conditions: ['none'],
      allergies: ['none'],
      recovery_needs: [],
      meal_preferences: [],
    },
  });

  // Fetch client profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['client-profile', userId],
    queryFn: () => profileService.getClientProfile(userId),
    enabled: !!userId,
  });

  // Update update mode when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setIsUpdateMode(true);
    }
  }, [profileData]);

  // Create or update profile mutation
  const createOrUpdateProfileMutation = useMutation({
    mutationFn: (data: CreateProfileData) => 
      profileService.createOrUpdateClientProfile(userId, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: isUpdateMode 
          ? 'Profile updated successfully' 
          : 'Profile created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['client-profile', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save profile',
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => 
      profileService.updateClientProfile(userId, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['client-profile', userId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      // Reset form with profile data
      form.reset({
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        current_weight: profileData.current_weight,
        target_weight: profileData.target_weight,
        activity_level: profileData.activity_level,
        diet_type: profileData.diet_type,
        health_conditions: profileData.health_conditions,
        allergies: profileData.allergies,
        recovery_needs: profileData.recovery_needs,
        meal_preferences: profileData.meal_preferences,
      });
    }
  }, [profileData, form]);

  const onSubmit = (data: FormData) => {
    if (isUpdateMode) {
      updateProfileMutation.mutate(data);
    } else {
      // Ensure all required fields are included for create operation
      createOrUpdateProfileMutation.mutate({
        age: data.age,
        gender: data.gender,
        height: data.height,
        current_weight: data.current_weight,
        target_weight: data.target_weight,
        activity_level: data.activity_level,
        diet_type: data.diet_type,
        health_conditions: data.health_conditions,
        allergies: data.allergies,
        recovery_needs: data.recovery_needs,
        meal_preferences: data.meal_preferences,
      });
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isLoading = isProfileLoading || createOrUpdateProfileMutation.isPending || updateProfileMutation.isPending;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/users')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Client Profile</h1>
            <p className="text-muted-foreground">
              {userData ? `Managing profile for ${userData.name}` : 'Loading user details...'}
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
              ? 'Update the client profile information below' 
              : 'Fill in the details to create a new client profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProfileLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <Collapsible open={openSections.basics} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('basics')}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">Basic Information</span>
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                  <SelectItem key={gender.value} value={gender.value}>
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {ACTIVITY_LEVELS.find(level => level.value === field.value)?.description}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Dietary Preferences */}
                <Collapsible open={openSections.dietary} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('dietary')}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">Dietary Preferences</span>
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
                                  <SelectItem key={diet.value} value={diet.value}>
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
                                      checked={field.value?.includes(preference.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, preference.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== preference.value
                                              )
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

                {/* Health Conditions */}
                <Collapsible open={openSections.health} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('health')}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">Health Information</span>
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
                                      checked={field.value?.includes(condition.value)}
                                      onCheckedChange={(checked) => {
                                        // Special handling for 'none' - exclusive selection
                                        if (condition.value === 'none') {
                                          return checked 
                                            ? field.onChange(['none']) 
                                            : field.onChange([]);
                                        }
                                        
                                        const newValue = checked
                                          ? [...field.value.filter(v => v !== 'none'), condition.value]
                                          : field.value?.filter(
                                              (value) => value !== condition.value
                                            );
                                        
                                        return field.onChange(newValue);
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
                                      checked={field.value?.includes(allergy.value)}
                                      onCheckedChange={(checked) => {
                                        // Special handling for 'none' - exclusive selection
                                        if (allergy.value === 'none') {
                                          return checked 
                                            ? field.onChange(['none']) 
                                            : field.onChange([]);
                                        }
                                        
                                        const newValue = checked
                                          ? [...field.value.filter(v => v !== 'none'), allergy.value]
                                          : field.value?.filter(
                                              (value) => value !== allergy.value
                                            );
                                        
                                        return field.onChange(newValue);
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
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Fitness Goals */}
                <Collapsible open={openSections.goals} className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection('goals')}
                      className="flex w-full justify-between p-4 rounded-none border-b"
                    >
                      <span className="text-lg font-semibold">Fitness Goals</span>
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
                                      checked={field.value?.includes(need.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, need.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== need.value
                                              )
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
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/users')}
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
                        {isUpdateMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isUpdateMode ? 'Update Profile' : 'Create Profile'}
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
