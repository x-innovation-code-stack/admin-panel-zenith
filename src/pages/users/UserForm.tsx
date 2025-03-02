import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { createUser, getUserById, updateUser } from '@/services/userService';
import { User, UserFormData } from '@/types/user';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  is_staff: z.boolean().default(false),
  is_superuser: z.boolean().default(false),
});

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [initialData, setInitialData] = useState<User | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      status: 'active',
      is_staff: false,
      is_superuser: false,
    },
    mode: "onChange",
  })

  const { isSubmitting, status: mutationStatus } = useMutation<User, Error, UserFormData>({
    mutationFn: async (data: UserFormData) => {
      if (id) {
        return await updateUser(Number(id), data);
      } else {
        return await createUser(data);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `User ${id ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} user.`,
        variant: "destructive",
      });
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(Number(id)),
    enabled: !!id,
    onSuccess: (data) => {
      setInitialData(data);
      form.reset({
        name: data.name,
        email: data.email,
        status: data.status,
        is_staff: data.is_staff,
        is_superuser: data.is_superuser,
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    status: initialData?.status || 'active' as 'active' | 'inactive' | 'pending',
    is_staff: initialData?.is_staff || false,
    is_superuser: initialData?.is_superuser || false,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userData: UserFormData = {
        name: values.name,
        email: values.email,
        password: values.password || undefined,
        status: values.status,
        is_staff: values.is_staff,
        is_superuser: values.is_superuser,
      };

      if (id) {
        await updateUser(Number(id), userData);
      } else {
        await createUser(userData);
      }

      toast({
        title: "Success",
        description: `User ${id ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} user.`,
        variant: "destructive",
      });
    }
  }

  if (isLoading && id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit User' : 'Create User'}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!id && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_staff"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Staff Status</FormLabel>
                  <FormDescription>
                    Designates whether the user can log into this admin site.
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_superuser"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Superuser Status</FormLabel>
                  <FormDescription>
                    Designates that this user has all permissions without explicitly assigning them.
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}
