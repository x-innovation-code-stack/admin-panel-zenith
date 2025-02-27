
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '@/services/userService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, LayoutGrid, Loader2, Plus, UserPlus, Users } from 'lucide-react';

const Dashboard = () => {
  const [userCounts, setUserCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0
  });
  
  const [usersByRole, setUsersByRole] = useState<{ name: string; value: number }[]>([]);
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', { page: 1 }],
    queryFn: () => userService.getUsers({ page: 1 }),
  });
  
  useEffect(() => {
    if (userData) {
      // Count users by status
      const statusCounts = userData.data.reduce(
        (acc: any, user: any) => {
          acc.total += 1;
          if (user.status === 'active') acc.active += 1;
          if (user.status === 'inactive') acc.inactive += 1;
          if (user.status === 'pending') acc.pending += 1;
          return acc;
        },
        { total: 0, active: 0, inactive: 0, pending: 0 }
      );
      
      setUserCounts(statusCounts);
      
      // Count users by role
      const roleCounts: Record<string, number> = {};
      userData.data.forEach((user: any) => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      
      const roleData = Object.entries(roleCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
      
      setUsersByRole(roleData);
    }
  }, [userData]);
  
  const COLORS = ['#9b87f5', '#b8a2f7', '#d6bcfa', '#e9d5fc', '#f3e8ff'];
  
  const userStatusData = [
    { name: 'Active', value: userCounts.active },
    { name: 'Inactive', value: userCounts.inactive },
    { name: 'Pending', value: userCounts.pending },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>
        <Button asChild className="bg-primary text-white">
          <Link to="/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-0 shadow-sm card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                userCounts.total
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered users in the system
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass border-0 shadow-sm card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                userCounts.active
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {userCounts.total > 0 
                ? `${Math.round((userCounts.active / userCounts.total) * 100)}% of total users`
                : 'No users in the system'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass border-0 shadow-sm card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                userCounts.inactive
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {userCounts.total > 0 
                ? `${Math.round((userCounts.inactive / userCounts.total) * 100)}% of total users`
                : 'No users in the system'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass border-0 shadow-sm card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <div className="h-4 w-4 rounded-full bg-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                userCounts.pending
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {userCounts.total > 0 
                ? `${Math.round((userCounts.pending / userCounts.total) * 100)}% of total users`
                : 'No users in the system'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of users by account status
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {userStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={usersByRole}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9b87f5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-0 shadow-sm card-transition hover:shadow-md hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">User Management</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Manage all user accounts in your system
            </p>
            <Button asChild className="w-full">
              <Link to="/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="glass border-0 shadow-sm card-transition hover:shadow-md hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Settings</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure system-wide settings and preferences
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/settings">
                <LayoutGrid className="mr-2 h-4 w-4" />
                View Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
