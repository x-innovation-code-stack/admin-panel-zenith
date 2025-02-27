
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gymService from '@/services/gymService';
import { CreateGymData, UpdateGymData } from '@/types/gym';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Building2, Loader2, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  address: z.string().min(5, { message: 'Please enter a valid address' }),
  phone: z.string().min(6, { message: 'Please enter a valid phone number' }),
});

type FormData = z.infer<typeof formSchema>;

const GymForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  // Fetch gym data if in edit mode
  const { data: gymData, isLoading: isGymLoading } = useQuery({
    queryKey: ['gym', id],
    queryFn: () => gymService.getGym(Number(id)),
    enabled: isEditMode,
  });

  // Create gym mutation
  const createGymMutation = useMutation({
    mutationFn: (data: CreateGymData) => gymService.createGym(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Gym created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      navigate('/gyms');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create gym',
        variant: 'destructive',
      });
    },
  });

  // Update gym mutation
  const updateGymMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGymData }) => 
      gymService.updateGym(id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Gym updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['gym', id] });
      navigate('/gyms');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update gym',
        variant: 'destructive',
      });
    },
  });

  // Set form values when gym data is loaded
  useEffect(() => {
    if (isEditMode && gymData) {
      form.reset({
        name: gymData.name,
        address: gymData.address,
        phone: gymData.phone,
      });
    }
  }, [gymData, form, isEditMode]);

  const onSubmit = (data: FormData) => {
    if (isEditMode && id) {
      updateGymMutation.mutate({ id: Number(id), data });
    } else {
      createGymMutation.mutate(data);
    }
  };

  const isLoading = isGymLoading || createGymMutation.isPending || updateGymMutation.isPending;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/gyms')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Gym' : 'Create Gym'}</h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update gym information' : 'Add a new gym to the system'}
            </p>
          </div>
        </div>
      </div>

      <Card className="glass card-gradient border-0 shadow-medium max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-gradient flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            {isEditMode ? 'Edit Gym Details' : 'New Gym Information'}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the gym information below' 
              : 'Fill in the details to create a new gym location'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGymLoading && isEditMode ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Power Fitness Gym" 
                          className="bg-white/70"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="123 Main Street, City, Country" 
                          className="bg-white/70 min-h-24"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="1234567890" 
                          type="tel"
                          className="bg-white/70"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/gyms')}
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
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update Gym' : 'Create Gym'}
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

export default GymForm;
