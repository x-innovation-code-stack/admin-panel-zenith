
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from './pages/NotFound';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import DietPlanList from './pages/diet-plans/DietPlanList';
import DietPlanForm from './pages/diet-plans/DietPlanForm';
import DietPlanMealPlans from './pages/diet-plans/DietPlanMealPlans';
import DuplicateDietPlan from './pages/diet-plans/DuplicateDietPlan';
import MealPlanDetail from './pages/diet-plans/MealPlanDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DietPlanList />} />
        <Route path="*" element={<NotFound />} />

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
      </Routes>
    </Router>
  );
}

export default App;
