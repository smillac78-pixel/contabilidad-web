import apiClient from "./api-client";
import type { CategoryResponse, CreateCategoryRequest } from "@/types/api";

export const categoriesService = {
  async list(): Promise<CategoryResponse[]> {
    const { data } = await apiClient.get("/api/v1/categories/");
    return data;
  },

  async create(payload: CreateCategoryRequest): Promise<CategoryResponse> {
    const { data } = await apiClient.post("/api/v1/categories/", payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },
};
