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

/** A student linked to a parent within the active school (from the tutor `show` payload). */
export interface ConnectedStudent {
  id: string;
  matricule: string | null;
  fullName: string;
  gender: string | null;
  className: string | null;
  imageUrl: string | null;
}

/** Full parent (tutor) detail: the base parent + its school-scoped connected students. */
export interface ParentDetail extends Parent {
  /** Whether the tutor account has been approved by the school. */
  isApproved: boolean;
  connectedStudents: ConnectedStudent[];
}

/** School-wide parent/attachment counters shown alongside the parents list. */
export interface ParentStats {
  totalParents: number;
  totalStudentsWithParent: number;
  totalStudentsWithoutParent: number;
}
