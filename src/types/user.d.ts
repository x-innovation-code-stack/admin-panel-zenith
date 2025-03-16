
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp_phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  whatsapp_phone?: string;
  status: 'active' | 'inactive';
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive' | '';
}
