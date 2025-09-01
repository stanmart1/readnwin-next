export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
  isStudent: boolean;
  studentInfo?: {
    schoolName: string;
    matriculationNumber: string;
    department: string;
    course: string;
  };
  readingStats: {
    totalBooksRead: number;
    totalPagesRead: number;
    totalHoursRead: number;
    currentStreak: number;
    averageRating: number;
    favoriteGenres: string[];
  };
  createdAt: string;
  lastLogin: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  isStudent?: boolean;
  studentInfo?: {
    schoolName?: string;
    matriculationNumber?: string;
    department?: string;
    course?: string;
  };
}