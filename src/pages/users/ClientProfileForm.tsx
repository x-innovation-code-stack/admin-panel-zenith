
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getUserProfile, updateUserProfile, UserProfile, UserProfileFormData } from '@/services/profileService';

export default function ClientProfileForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNew, setIsNew] = useState(false);

  // Define the form
  const form = useForm<UserProfileFormData>({
    defaultValues: {
      bio: '',
      height: undefined,
      weight: undefined,
      birth_date: '',
      goals: [],
      allergies: [],
      medications: [],
    },
  });

  // Fetch user profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => getUserProfile(Number(id)),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        bio: profile.bio || '',
        height: profile.height,
        weight: profile.weight,
        birth_date: profile.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
        goals: profile.goals || [],
        allergies: profile.allergies || [],
        medications: profile.medications || [],
      });
    } else if (error) {
      // If profile doesn't exist, we're creating a new one
      setIsNew(true);
    }
  }, [profile, error, form]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: (data: UserProfileFormData) => updateUserProfile(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
      toast.success(isNew ? 'Profile created successfully' : 'Profile updated successfully');
      navigate(`/users`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const onSubmit = (data: UserProfileFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isNew ? 'Create Client Profile' : 'Edit Client Profile'}</CardTitle>
          <CardDescription>
            {isNew 
              ? 'Create a new profile for this client with their health information and goals.' 
              : 'Update the client profile with their latest health information and goals.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Client biography and background information" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include any relevant background information about the client.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Height in centimeters" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Weight in kilograms" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end gap-2 px-0">
                <Button type="button" variant="outline" onClick={() => navigate('/users')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : isNew ? 'Create Profile' : 'Update Profile'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
