import { z } from "zod";

// z.coerce.boolean() usa Boolean(valor) por debajo, y Boolean("false") es `true`
// (cualquier string no vacio es verdadero en JS) - por eso un query param como
// "?cerrado=false" terminaria filtrando por true. Este helper interpreta los
// strings "true"/"false" correctamente.
export const booleanQueryParam = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function toSkipTake({ page, pageSize }: Pagination) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  { page, pageSize }: Pagination,
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
