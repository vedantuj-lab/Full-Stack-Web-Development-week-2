import { ApiResponse } from '../types';

const TOKEN_KEY = 'learnsphere_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    data: null as any,
    message: 'Invalid server response',
    error: {
      code: 'NETWORK_ERROR',
      message: `HTTP error ${response.status}: ${response.statusText}`,
    },
  }));

  if (!response.ok && !data.error) {
    data.error = {
      code: `HTTP_${response.status}`,
      message: data.message || 'Request failed',
    };
  }

  return data;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; full_name: string; role?: string }) =>
    apiRequest<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiRequest<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  switchDemo: (role: 'student' | 'instructor' | 'admin') =>
    apiRequest<{ user: any; token: string }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify(role ? { role } : {}),
    }),

  getMe: () => apiRequest<{ user: any; stats: any }>('/api/me'),

  updateProfile: (updates: any) =>
    apiRequest('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  changePassword: (body: { old_password: string; new_password: string }) =>
    apiRequest('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Courses
  getCourses: (params?: { category?: string; difficulty?: string; search?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    return apiRequest<any[]>(`/api/courses?${query.toString()}`);
  },

  getCourse: (id: string) => apiRequest<any>(`/api/courses/${id}`),

  createCourse: (data: any) =>
    apiRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (id: string, data: any) =>
    apiRequest(`/api/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  publishCourse: (id: string) =>
    apiRequest(`/api/courses/${id}/publish`, {
      method: 'POST',
    }),

  deleteCourse: (id: string) =>
    apiRequest(`/api/courses/${id}`, {
      method: 'DELETE',
    }),

  enrollCourse: (id: string) =>
    apiRequest(`/api/courses/${id}/enroll`, {
      method: 'POST',
    }),

  getMyCourses: () => apiRequest<any[]>('/api/my/courses'),

  // Lessons
  getCourseLessons: (courseId: string) => apiRequest<any[]>(`/api/courses/${courseId}/lessons`),

  getLesson: (id: string) => apiRequest<any>(`/api/lessons/${id}`),

  createLesson: (courseId: string, data: any) =>
    apiRequest(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLesson: (id: string, data: any) =>
    apiRequest(`/api/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteLesson: (id: string) =>
    apiRequest(`/api/lessons/${id}`, {
      method: 'DELETE',
    }),

  setLessonComplete: (id: string, completed: boolean) =>
    apiRequest(`/api/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    }),

  // Quizzes & Assessments
  getCourseQuizzes: (courseId: string) => apiRequest<any[]>(`/api/courses/${courseId}/quizzes`),

  getQuiz: (id: string) => apiRequest<any>(`/api/quizzes/${id}`),

  createQuiz: (courseId: string, data: any) =>
    apiRequest(`/api/courses/${courseId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitQuizAttempt: (quizId: string, answers: Record<string, string>) =>
    apiRequest<any>(`/api/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getMyAssessments: () => apiRequest<any[]>('/api/my/assessments'),

  // Certificates
  getMyCertificates: () => apiRequest<any[]>('/api/my/certificates'),

  claimCertificate: (courseId: string) =>
    apiRequest(`/api/courses/${courseId}/claim-certificate`, {
      method: 'POST',
    }),

  verifyCertificate: (code: string) => apiRequest<any>(`/api/certificates/${code}/verify`),

  // Announcements & Notifications
  getCourseAnnouncements: (courseId: string) => apiRequest<any[]>(`/api/courses/${courseId}/announcements`),

  createAnnouncement: (courseId: string, data: { title: string; content: string }) =>
    apiRequest(`/api/courses/${courseId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyNotifications: () => apiRequest<any[]>('/api/my/notifications'),

  markNotificationRead: (id: string) =>
    apiRequest(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Instructor
  getInstructorOverview: () => apiRequest<any>('/api/instructor/overview'),
  getInstructorCourses: () => apiRequest<any[]>('/api/instructor/courses'),
  getInstructorStudents: (courseId: string) => apiRequest<any>(`/api/instructor/courses/${courseId}/students`),
  getInstructorAnalytics: () => apiRequest<any[]>('/api/instructor/analytics'),

  // Admin
  getAdminOverview: () => apiRequest<any>('/api/admin/overview'),
  getAdminUsers: (params?: { search?: string; role?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    return apiRequest<any[]>(`/api/admin/users?${query.toString()}`);
  },
  setUserStatus: (id: string, status: 'active' | 'suspended') =>
    apiRequest(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  setUserRole: (id: string, role: string) =>
    apiRequest(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getAdminCourses: () => apiRequest<any[]>('/api/admin/courses'),
  approveCourse: (id: string) =>
    apiRequest(`/api/admin/courses/${id}/approve`, {
      method: 'POST',
    }),
  rejectCourse: (id: string) =>
    apiRequest(`/api/admin/courses/${id}/reject`, {
      method: 'POST',
    }),
  getAdminActivityLogs: () => apiRequest<any[]>('/api/admin/activity-logs'),
  getAdminReports: () => apiRequest<any>('/api/admin/reports'),
  resetDatabase: () =>
    apiRequest('/api/admin/reset-database', {
      method: 'POST',
    }),
};
