/**
 * Pagination Helper
 * 
 * Standardizes query pagination across all list endpoints.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(query.pageSize || '25'), 10) || 25));
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { page, pageSize, skip, limit };
}

export function paginate<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
}
