
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from './pages/NotFound';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import DietPlanList from './pages/diet-plans/DietPlanList';
import DietPlanForm from './pages/diet-plans/DietPlanForm';
import DietPlanMealPlans from './pages/diet-plans/DietPlanMealPlans';
import DuplicateDietPlan from './pages/diet-plans/DuplicateDietPlan';
import MealPlanDetail from './pages/diet-plans/MealPlanDetail';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DietPlanList />} />
          
          {/* Users */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />

          {/* Diet Plans */}
          <Route path="/diet-plans" element={<DietPlanList />} />
          <Route path="/diet-plans/create" element={<DietPlanForm />} />
          <Route path="/diet-plans/:id/edit" element={<DietPlanForm />} />
          <Route path="/diet-plans/:id/duplicate" element={<DuplicateDietPlan />} />
          <Route path="/diet-plans/:id" element={<DietPlanMealPlans />} />
          <Route path="/diet-plans/:id/meal-plans/:day" element={<MealPlanDetail />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
