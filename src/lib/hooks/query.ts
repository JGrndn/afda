export interface QueryOptions<T = any> {
  // Filtres spécifiques au modèle
  filters?: Record<string, any>;
  // Recherche globale
  search?: string;
  // Tri
  orderBy?: T; // Type Prisma spécifique (ex: Prisma.MemberOrderByWithRelationInput)
  // Pagination
  skip?: number;
  take?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
