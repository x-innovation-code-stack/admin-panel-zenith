
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import gymService from '@/services/gymService';
import userService from '@/services/userService';
import { GymUser, GymUserRole, GymUserStatus, AddGymUserData } from '@/types/gym';
import { User } from '@/types/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Constants for role and status
const GYM_USER_ROLES = ['gym_admin', 'trainer', 'dietitian', 'client'] as const;
const GYM_USER_STATUSES = ['active', 'inactive'] as const;

// Form schema for adding a user
const addUserSchema = z.object({
  user_id: z.number().positive({ message: 'Please select a user' }),
  role: z.enum(GYM_USER_ROLES),
  status: z.enum(GYM_USER_STATUSES),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

const GymUserList = () => {
  const { id: gymId } = useParams();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<GymUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gym details
  const { data: gym } = useQuery({
    queryKey: ['gym', gymId],
    queryFn: () => gymService.getGym(Number(gymId)),
    enabled: !!gymId,
  });

  // Fetch gym users with filters
  const {
    data: gymUsers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['gym-users', gymId, selectedRole, selectedStatus],
    queryFn: () => gymService.getGymUsers(
      Number(gymId), 
      selectedRole || undefined, 
      selectedStatus || undefined
    ),
    enabled: !!gymId,
  });

  // Fetch available users for adding
  const { data: userData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(), // This will now return the correct type
  });

  // Add user to gym mutation
  const addUserMutation = useMutation({
    mutationFn: (data: AddGymUserData) => 
      gymService.addUserToGym(Number(gymId), data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User added to gym successfully',
      });
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['gym-users', gymId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add user to gym',
        variant: 'destructive',
      });
    },
  });

  // Remove user from gym mutation
  const removeUserMutation = useMutation({
    mutationFn: ({ gymId, userId }: { gymId: number; userId: number }) => 
      gymService.removeUserFromGym(gymId, userId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User removed from gym successfully',
      });
      setUserToRemove(null);
      queryClient.invalidateQueries({ queryKey: ['gym-users', gymId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove user from gym',
        variant: 'destructive',
      });
    },
  });

  // Form for adding a user
  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      user_id: 0,
      role: 'client',
      status: 'active',
    },
  });

  // Handle form submission
  const onSubmit = (data: AddUserFormData) => {
    // Ensure all required fields are present
    addUserMutation.mutate({
      user_id: data.user_id,
      role: data.role,
      status: data.status
    });
  };

  // Handle user removal
  const handleRemoveUser = (user: GymUser) => {
    setUserToRemove(user);
  };

  // Confirm user removal
  const confirmRemoveUser = () => {
    if (userToRemove) {
      removeUserMutation.mutate({
        gymId: Number(gymId),
        userId: userToRemove.user_id,
      });
    }
  };

  // Get users array from userData
  const users = userData?.data || [];

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
            <h1 className="text-2xl font-bold">Gym Members</h1>
            <p className="text-muted-foreground">
              {gym?.name ? `Managing members for ${gym.name}` : 'Loading gym details...'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-gradient shadow-soft"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card className="glass card-gradient border-0 shadow-medium mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-gradient flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Members
          </CardTitle>
          <CardDescription>
            View and manage all members of this gym
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">Filter by Role</label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="bg-white/70 w-full sm:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {GYM_USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">Filter by Status</label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="bg-white/70 w-full sm:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {GYM_USER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            // Error state
            <div className="text-center py-8 text-destructive">
              <p>Failed to load gym members: {(error as Error).message}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['gym-users', gymId] })}
              >
                Retry
              </Button>
            </div>
          ) : gymUsers?.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/80" />
              <h3 className="mt-4 text-lg font-semibold">No members found</h3>
              <p className="text-muted-foreground mt-2">
                {selectedRole || selectedStatus 
                  ? 'Try changing the filters or add new members.'
                  : 'Start by adding members to this gym.'}
              </p>
              <Button
                className="mt-4 btn-gradient"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          ) : (
            // Data loaded successfully
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gymUsers.map((gymUser) => (
                    <TableRow key={gymUser.id}>
                      <TableCell className="font-medium">{gymUser.user.name}</TableCell>
                      <TableCell>{gymUser.user.email}</TableCell>
                      <TableCell>
                        <span className="capitalize">{gymUser.role.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          gymUser.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {gymUser.status.charAt(0).toUpperCase() + gymUser.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveUser(gymUser)}
                          title="Remove Member"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Gym</DialogTitle>
            <DialogDescription>
              Select a user and assign a role to add them to this gym.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user: User) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value: GymUserRole) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GYM_USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value: GymUserStatus) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/70">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GYM_USER_STATUSES.map((status) => (
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
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-gradient"
                  disabled={addUserMutation.isPending}
                >
                  {addUserMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove User Confirmation Dialog */}
      <Dialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {userToRemove?.user.name} from this gym? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToRemove(null)}
              disabled={removeUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveUser}
              disabled={removeUserMutation.isPending}
            >
              {removeUserMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymUserList;
