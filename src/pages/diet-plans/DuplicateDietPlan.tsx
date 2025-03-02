import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { duplicateDietPlan } from '@/services/dietPlanService';
import { DietPlanDuplicateData } from '@/types/dietPlan';

export default function DuplicateDietPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<DietPlanDuplicateData>({
    new_title: '',
    client_id: 0,
    start_date: '',
    end_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.new_title || !formData.client_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const duplicateData: DietPlanDuplicateData = {
      new_title: formData.new_title,
      client_id: formData.client_id,
      start_date: formData.start_date,
      end_date: formData.end_date
    };
    
    try {
      await duplicateDietPlan(Number(id), duplicateData);
      toast({
        title: "Success",
        description: "Diet plan duplicated successfully!",
        variant: "default"
      });
      navigate(`/diet-plans/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate diet plan.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Duplicate Diet Plan</CardTitle>
          <CardDescription>Fill in the details to create a duplicate of the diet plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Title</label>
              <input
                type="text"
                value={formData.new_title}
                onChange={(e) => setFormData({ ...formData, new_title: e.target.value })}
                required
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Client ID</label>
              <input
                type="number"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                required
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="input"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="input"
              />
            </div>
            <Button type="submit">Duplicate Diet Plan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
