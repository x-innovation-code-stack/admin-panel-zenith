
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import gymService from '@/services/gymService';
import { Gym } from '@/types/gym';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Edit, Plus, Trash2, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const GymList = () => {
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gyms
  const {
    data: gyms,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['gyms'],
    queryFn: gymService.getGyms,
  });

  // Delete gym mutation
  const deleteGymMutation = useMutation({
    mutationFn: (id: number) => gymService.deleteGym(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Gym deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      setGymToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete gym',
        variant: 'destructive',
      });
    },
  });

  // Handler for deleting a gym
  const handleDelete = (gym: Gym) => {
    setGymToDelete(gym);
  };

  // Handler for confirming deletion
  const confirmDelete = () => {
    if (gymToDelete) {
      deleteGymMutation.mutate(gymToDelete.id);
    }
  };

  // Handle view gym users
  const handleViewUsers = (gymId: number) => {
    navigate(`/gyms/${gymId}/users`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gyms</h1>
          <p className="text-muted-foreground">Manage your gyms</p>
        </div>
        <Button
          onClick={() => navigate('/gyms/new')}
          className="btn-gradient shadow-soft"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Gym
        </Button>
      </div>

      <Card className="glass card-gradient border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="text-gradient flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Gym Facilities
          </CardTitle>
          <CardDescription>
            View and manage all gym locations in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <p>Failed to load gyms: {(error as Error).message}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['gyms'] })}
              >
                Retry
              </Button>
            </div>
          ) : gyms?.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/80" />
              <h3 className="mt-4 text-lg font-semibold">No gyms found</h3>
              <p className="text-muted-foreground mt-2">
                Start by adding your first gym to the system.
              </p>
              <Button
                className="mt-4 btn-gradient"
                onClick={() => navigate('/gyms/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Gym
              </Button>
            </div>
          ) : (
            // Data loaded successfully
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gyms.map((gym) => (
                    <TableRow key={gym.id}>
                      <TableCell className="font-medium">{gym.name}</TableCell>
                      <TableCell>{gym.address}</TableCell>
                      <TableCell>{gym.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewUsers(gym.id)}
                            title="View Users"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/gyms/${gym.id}`)}
                            title="Edit Gym"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(gym)}
                            title="Delete Gym"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!gymToDelete} onOpenChange={(open) => !open && setGymToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gym</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {gymToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGymToDelete(null)}
              disabled={deleteGymMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteGymMutation.isPending}
            >
              {deleteGymMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GymList;
