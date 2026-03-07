// Tipos manuales hasta generar desde OpenAPI con: npm run generate:api

export interface ExpenseResponse {
  id: string;
  family_id: string;
  category_id: string;
  category_name: string;
  created_by: string;
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
  created_at: string;
}

export interface CreateExpenseRequest {
  category_id: string;
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
}

export interface PaginatedExpensesResponse {
  items: ExpenseResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface CategoryResponse {
  id: string;
  family_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_system: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface ApiError {
  error: string;
  message: string;
}
