export type DocumentType = 'syllabus' | 'notes' | 'textbook' | 'past_paper';

export interface Chunk {
  id: string;
  docId: string;
  docTitle: string;
  section: string;
  pageOrParagraph?: string;
  text: string;
  keywords: string[];
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  uploadedAt: string;
  content: string;
  wordCount: number;
  chunks: Chunk[];
}

export type MasteryStatus = 'unassessed' | 'weak' | 'medium' | 'strong';

export interface Topic {
  id: string;
  courseId: string;
  unit: string;
  name: string;
  description: string;
  weightage: number; // percentage, e.g. 25
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  relatedChunkIds: string[];
  status: MasteryStatus;
  masteryScore: number; // 0 to 100
  lastAssessed: string | null;
  questionsAttempted: number;
  questionsCorrect: number;
  diagnosisReason: string;
  identifiedMisconceptions: string[];
  recommendedAction: string;
}

export interface Citation {
  docTitle: string;
  section: string;
  excerpt: string;
}

export interface Question {
  id: string;
  topicId: string;
  topicName: string;
  type: 'conceptual_mcq' | 'scenario' | 'past_paper_style' | 'analytical';
  prompt: string;
  options: string[];
  correctIndex: number;
  citation: Citation;
  explanation: string;
  distractorRationales: Record<number, string>;
  commonTrap: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizSession {
  id: string;
  courseId: string;
  startedAt: string;
  completedAt?: string;
  questions: Question[];
  userAnswers: Record<string, number>;
  score: number;
  evaluated: boolean;
  topicDeltas?: Record<string, {
    previousScore: number;
    newScore: number;
    status: MasteryStatus;
  }>;
}

export interface TopicDiagnosis {
  topicId: string;
  status: 'weak' | 'medium' | 'strong';
  masteryScore: number;
  diagnosisReason: string;
  identifiedMisconceptions: string[];
  recommendedAction: string;
}

export interface GapReport {
  id: string;
  courseId: string;
  createdAt: string;
  examRiskScore: number; // 0 (prepared) to 100 (high danger)
  overallVerdict: string;
  weakCount: number;
  mediumCount: number;
  strongCount: number;
  unassessedCount: number;
  topicDiagnoses: TopicDiagnosis[];
}

export interface RevisionBlock {
  id: string;
  topicId: string;
  topicName: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedMinutes: number;
  action: string;
  sourceCitation: string;
  completed: boolean;
  type: 'concept_review' | 'worked_example' | 'past_paper_drill' | 'active_recall';
}

export interface RevisionDay {
  dayNumber: number;
  dateLabel: string;
  focus: string;
  blocks: RevisionBlock[];
}

export interface RevisionPlan {
  id: string;
  courseId: string;
  generatedAt: string;
  examDate: string;
  daysAvailable: number;
  hoursPerDay: number;
  totalAllocatedHours: number;
  overallStrategy: string;
  overallRiskLevel: 'High' | 'Medium' | 'Low';
  days: RevisionDay[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  department: string;
  examDate: string;
  daysRemaining: number;
  studyHoursPerDay: number;
  documents: Document[];
  topics: Topic[];
  gapReport: GapReport | null;
  revisionPlan: RevisionPlan | null;
  quizHistory: QuizSession[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'judge';
  avatar: string;
  activeCourseId: string;
  streakDays: number;
}
