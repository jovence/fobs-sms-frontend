export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  childrenCount: number;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ParentInput {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
}

export interface ParentQuery {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: keyof Parent;
  sortDir?: "asc" | "desc";
}
