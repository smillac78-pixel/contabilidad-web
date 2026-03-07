import apiClient from "./api-client";
import type {
  CreateExpenseRequest,
  ExpenseResponse,
  PaginatedExpensesResponse,
} from "@/types/api";

export interface ExpenseFilters {
  from_date?: string;
  to_date?: string;
  category_id?: string;
  page?: number;
  page_size?: number;
}

export const expensesService = {
  async list(filters: ExpenseFilters = {}): Promise<PaginatedExpensesResponse> {
    const { data } = await apiClient.get("/api/v1/expenses/", { params: filters });
    return data;
  },

  async create(payload: CreateExpenseRequest): Promise<ExpenseResponse> {
    const { data } = await apiClient.post("/api/v1/expenses/", payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/expenses/${id}`);
  },
};
