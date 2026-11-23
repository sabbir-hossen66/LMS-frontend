export type Role = 'ADMIN' | 'STUDENT';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type EnrollmentStatus = 'ACTIVE' | 'REVOKED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  isFreePreview?: boolean;
  order: number;
  duration: number;
  storageKey?: string;
  mimeType?: string;
  isLocked?: boolean;
  progress?: {
    lastPosition: number;
    watchedSeconds: number;
    completed: boolean;
  } | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string | null;
  status: CourseStatus;
  isEnrolled?: boolean;
  totalVideos?: number;
  totalStudents?: number;
  videos?: Video[];
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  message?: string;
  error?: string;
}
