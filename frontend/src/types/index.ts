export interface User {
  id: string;
  business_name: string;
  email: string;
  currency: string;
  default_period: number;
  reminder_days: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  national_id?: string;
  address?: string;
  notes?: string;
  created_at: string;
  active_contracts?: number;
  total_outstanding?: number;
  contracts?: Contract[];
}

export interface Contract {
  id: string;
  user_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  product_name: string;
  product_category?: string;
  total_price: number;
  deposit: number;
  remaining_balance: number;
  installment_period: number;
  installment_amount: number;
  start_date: string;
  end_date: string;
  payment_day: number;
  status: 'active' | 'completed' | 'defaulted';
  created_at: string;
  installments?: Installment[];
  payments?: Payment[];
}

export interface Installment {
  id: string;
  contract_id: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'paid' | 'late' | 'partial';
  paid_date?: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  installment_id?: string;
  amount: number;
  payment_date: string;
  note?: string;
}

export interface DashboardData {
  totalCustomers: number;
  activeContracts: number;
  outstandingBalance: number;
  collectedThisMonth: number;
  overdueCount: number;
  upcomingPayments: (Installment & { product_name: string; customer_name: string; customer_phone: string })[];
  monthlyCollections: { month: string; total: number }[];
  statusCounts: { status: string; count: number }[];
}

export interface AIParsed {
  customer_name: string | null;
  product_name: string | null;
  product_category: string | null;
  total_price: number | null;
  deposit: number | null;
  installment_period: number | null;
  installment_amount: number | null;
}
