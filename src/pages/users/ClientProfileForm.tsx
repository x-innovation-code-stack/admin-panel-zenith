import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/services/profileService';
import { useState } from 'react';

export default function ClientProfileForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => getUserProfile(Number(id)),
    enabled: !!id,
    onSuccess: (data) => {
      setFormData({
        bio: data?.bio || '',
        address: data?.address || '',
        weight_kg: data?.weight_kg || undefined,
        height_cm: data?.height_cm || undefined,
        goal: data?.goal || '',
      });
    }
  });

  const [formData, setFormData] = useState({
    bio: '',
    address: '',
    weight_kg: undefined,
    height_cm: undefined,
    goal: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(Number(id), data),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
      navigate('/users');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const isSubmitting = mutation.isPending;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Client Profile</CardTitle>
          <CardDescription>Update your client's profile information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little bit about yourself"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                placeholder="Your address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                type="number"
                id="weight_kg"
                placeholder="Your weight in kg"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                type="number"
                id="height_cm"
                placeholder="Your height in cm"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal</Label>
              <Input
                type="text"
                id="goal"
                placeholder="Your fitness goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
            </div>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <CardDescription>
            Make sure to save your changes before leaving.
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
