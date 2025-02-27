
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { CreateUserData, UpdateUserData } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

// Define as const array to get proper type inference
const USER_STATUSES = ['active', 'inactive', 'pending'] as const;
type UserStatus = (typeof USER_STATUSES)[number];

const createUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phone: z.string().optional(),
  whatsapp_phone: z.string().optional(),
  status: z.enum(USER_STATUSES),
  role: z.string().min(1, { message: 'Please select a role' }),
});

const updateUserSchema = createUserSchema.extend({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional().or(z.literal('')),
}).omit({ email: true }).extend({
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const UserForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form
  const [schema, setSchema] = useState(isEditMode ? updateUserSchema : createUserSchema);

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      whatsapp_phone: '',
      status: 'active' as UserStatus,
      role: '',
    },
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.getRoles(),
  });

  // Fetch user data if in edit mode
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(Number(id)),
    enabled: isEditMode,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) => 
      userService.updateUser(id, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      navigate('/users');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (isEditMode && userData) {
      // Type assertion for status
      let status: UserStatus = 'active';
      
      // Check if the status from API is valid
      if (userData.status === 'active' || userData.status === 'inactive' || userData.status === 'pending') {
        status = userData.status as UserStatus;
      }
      
      form.reset({
        name: userData.name,
        email: userData.email,
        password: '',
        phone: userData.phone || '',
        whatsapp_phone: userData.whatsapp_phone || '',
        status, // Just use the validated status
        role: userData.role,
      });
    }
  }, [userData, form, isEditMode]);

  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEditMode && id) {
      // Create a copy to ensure type safety
      const submissionData = { ...data };
      
      // Filter out empty fields for the update
      const updateData = Object.entries(submissionData).reduce((acc, [key, value]) => {
        if (value !== '') {
          if (key === 'status') {
            // Explicitly handle the status field with type assertion
            const typedStatus = value as unknown;
            if (typedStatus === 'active' || typedStatus === 'inactive' || typedStatus === 'pending') {
              acc[key as keyof UpdateUserData] = typedStatus as UserStatus;
            } else {
              acc[key as keyof UpdateUserData] = 'active' as UserStatus;
            }
          } else {
            acc[key as keyof UpdateUserData] = value;
          }
        }
        return acc;
      }, {} as UpdateUserData);
      
      updateUserMutation.mutate({ id: Number(id), data: updateData });
    } else {
      createUserMutation.mutate(data as CreateUserData);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

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
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Create User'}</h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update user information' : 'Add a new user to the system'}
            </p>
          </div>
        </div>
      </div>

      <Card className="glass card-gradient border-0 shadow-medium max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-gradient">{isEditMode ? 'Edit User Details' : 'User Information'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the user information below. Leave password blank to keep unchanged.' 
              : 'Fill in the details to create a new user account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUserLoading && isEditMode ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="bg-white/70" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="user@example.com" 
                            type="email" 
                            disabled={isEditMode}
                            className="bg-white/70"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isEditMode ? 'New Password (optional)' : 'Password'}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={isEditMode ? 'Leave blank to keep unchanged' : '••••••••'} 
                            type="password"
                            className="bg-white/70"
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="whatsapp_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number (optional)</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={(value: string) => {
                            // Type guard to ensure value is a valid UserStatus
                            if (value === 'active' || value === 'inactive' || value === 'pending') {
                              field.onChange(value);
                            } else {
                              field.onChange('active');
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/70">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {USER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/70">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.map((role: string) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
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
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update User' : 'Create User'}
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

export default UserForm;
