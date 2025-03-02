import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import ClientProfile from './pages/users/ClientProfile';
import ClientProfileForm from './pages/users/ClientProfileForm';
import DietPlanList from './pages/diet-plans/DietPlanList';
import DietPlanForm from './pages/diet-plans/DietPlanForm';
import DietPlanMealPlans from './pages/diet-plans/DietPlanMealPlans';
import DuplicateDietPlan from './pages/diet-plans/DuplicateDietPlan';
import MealPlanDetail from './pages/diet-plans/MealPlanDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />

        {/* Users */}
        <Route path="/users" element={<UserList />} />
        <Route path="/users/create" element={<UserForm />} />
        <Route path="/users/:id/edit" element={<UserForm />} />

        {/* Clients */}
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/create" element={<ClientForm />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
        <Route path="/clients/:id/profile" element={<ClientProfile />} />
        <Route path="/clients/:id/profile/edit" element={<ClientProfileForm />} />

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
