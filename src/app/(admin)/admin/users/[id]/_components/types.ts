"use client";

import { UserRole } from "@/types/enums";
import type { UserStatus } from "@/types/enums";
export { UserStatus } from "@/types/enums";

export interface AdminNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  id: string;
  earnedAt: string;
  achievement: { title: string; icon: string; xpReward: number };
}

export interface UserExamResult {
  id: string;
  score: number;
  takenAt: string;
  exam: { title: string; subject: { name: string } };
}

export interface UserStudySession {
  id: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  focusScore: number;
  subject: { name: string } | null;
}

export interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean | null;
  phone: string | null;
  phoneVerified: boolean | null;
  twoFactorEnabled: boolean;
  twoFactorEnforced?: boolean;
  balance?: number;
  aiCredits?: number;
  examCredits?: number;
  activeSubscriptionId?: string | null;
  subscriptionExpiresAt?: string | null;
  googleId?: string | null;
  githubId?: string | null;
  authProvider?: string | null;
  createdBy?: string | null;
  archivedAt?: string | null;
  statusReason?: string | null;
  statusExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  tasksCompleted: number;
  examsPassed: number;
  pomodoroSessions: number;
  deepWorkSessions: number;
  studyXP: number;
  taskXP: number;
  examXP: number;
  challengeXP: number;
  questXP: number;
  seasonXP: number;
  gradeLevel: string | null;
  educationType: string | null;
  section: string | null;
  interestedSubjects: string[];
  studyGoal: string | null;
  bio: string | null;
  school: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  adminNotes?: AdminNote[];
  _count: {
    tasks: number;
    studySessions: number;
    achievements: number;
    notifications: number;
    examResults: number;
    subjectEnrollments: number;
    customGoals: number;
    reminders: number;
    sessions: number;
  };
  achievements: UserAchievement[];
  examResults: UserExamResult[];
  studySessions: UserStudySession[];
}

// Re-export constants from lib modules
export { roleColors, roleLabels } from "./_lib/role-constants";
export { statusColors, statusLabels } from "./_lib/status-constants";
export {
  gradeLabels,
  gradeLevelOptions,
  educationTypeOptions,
  genderOptions,
  roleOptions,
  resolveGradeLabel,
  resolveEducationTypeLabel,
} from "./_lib/grade-constants";
export {
  EDITABLE_USER_FIELDS,
  pickEditableUserFields,
  type EditableUserField,
} from "./_lib/editable-fields";
export {
  computeLevelProgress,
  type LevelProgress,
} from "./_lib/level-progress";