
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import ClientProfileForm from "./pages/users/ClientProfileForm";
import GymList from "./pages/gyms/GymList";
import GymForm from "./pages/gyms/GymForm";
import GymUserList from "./pages/gyms/GymUserList";
import DietPlanList from "./pages/diet-plans/DietPlanList";
import DietPlanForm from "./pages/diet-plans/DietPlanForm";
import DietPlanMealPlans from "./pages/diet-plans/DietPlanMealPlans";
import DuplicateDietPlan from "./pages/diet-plans/DuplicateDietPlan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* User Routes */}
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id" element={<UserForm />} />
              <Route path="/users/:id/profile" element={<ClientProfileForm />} />

              {/* Gym Routes */}
              <Route path="/gyms" element={<GymList />} />
              <Route path="/gyms/new" element={<GymForm />} />
              <Route path="/gyms/:id" element={<GymForm />} />
              <Route path="/gyms/:id/users" element={<GymUserList />} />

              {/* Diet Plan Routes */}
              <Route path="/diet-plans" element={<DietPlanList />} />
              <Route path="/diet-plans/new" element={<DietPlanForm />} />
              <Route path="/diet-plans/:id" element={<DietPlanForm />} />
              <Route path="/diet-plans/:id/meal-plans" element={<DietPlanMealPlans />} />
              <Route path="/diet-plans/:id/duplicate" element={<DuplicateDietPlan />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
