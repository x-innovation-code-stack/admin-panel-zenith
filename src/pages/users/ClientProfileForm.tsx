import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientProfile, updateClientProfile } from '@/services/userService';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  bio: z.string().optional(),
  address: z.string().optional(),
  weight_kg: z.number().optional(),
  height_cm: z.number().optional(),
  goal: z.string().optional(),
});

export default function ClientProfileForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      address: "",
      weight_kg: undefined,
      height_cm: undefined,
      goal: "",
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['client-profile', id],
    queryFn: () => getClientProfile(Number(id)),
    onSettled: (data, error) => {
      if (data) {
        // Set form values from the API response
        form.setValue('bio', data.bio || "");
        form.setValue('address', data.address || "");
        form.setValue('weight_kg', data.weight_kg || undefined);
        form.setValue('height_cm', data.height_cm || undefined);
        form.setValue('goal', data.goal || "");
      }
    }
  });

  const { mutate: updateProfile, isSubmitting } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => updateClientProfile(Number(id), data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['client-profile', id] });
      navigate(`/users/${id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update client profile.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateProfile(values);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/users/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Client Profile</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Profile</CardTitle>
          <CardDescription>Update client profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about the client"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a short bio about the client.
                    </FormDescription>
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
                      <Input placeholder="Client address" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the client's address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Client weight in kg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the client's weight in kilograms.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Client height in cm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the client's height in centimeters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="Client fitness goal" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the client's fitness goal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
