import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, UserProfile, Document, Topic, QuizSession, RevisionPlan, TopicDiagnosis, GapReport } from '../types';
import { INITIAL_COURSES, DEMO_PROFILES } from '../data/sampleCourses';

interface AppContextType {
  currentUser: UserProfile;
  demoProfiles: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  courses: Course[];
  activeCourseId: string;
  activeCourse: Course;
  setActiveCourseId: (id: string) => void;
  activeTab: 'diagnosis' | 'quiz' | 'plan' | 'topics' | 'galaxy' | 'music' | 'materials' | 'assistant' | 'architecture';
  setActiveTab: (tab: 'diagnosis' | 'quiz' | 'plan' | 'topics' | 'galaxy' | 'music' | 'materials' | 'assistant' | 'architecture') => void;
  uploadDocument: (doc: Document) => void;
  addCourse: (newCourse: Course) => void;
  updateTopics: (topics: Topic[]) => void;
  recordQuizCompletion: (
    session: QuizSession,
    diagnosis: { examRiskScore: number; overallVerdict: string; topicDiagnoses: TopicDiagnosis[] }
  ) => void;
  setRevisionPlan: (plan: RevisionPlan) => void;
  togglePlanBlock: (dayNumber: number, blockId: string) => void;
  resetAllData: () => void;
  loginUser: (email: string, name: string) => void;
  isGeneratingAI: boolean;
  setIsGeneratingAI: (val: boolean) => void;
}

const STORAGE_KEY_COURSES = 'gapfinder_courses_v2';
const STORAGE_KEY_USER = 'gapfinder_user_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoProfiles] = useState<UserProfile[]>(DEMO_PROFILES);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_PROFILES[0]; // Default to Judge Mode for instant evaluation
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COURSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    return currentUser.activeCourseId || INITIAL_COURSES[0].id;
  });

  const [activeTab, setActiveTab] = useState<'diagnosis' | 'quiz' | 'plan' | 'topics' | 'galaxy' | 'music' | 'materials' | 'assistant' | 'architecture'>('diagnosis');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.warn('LocalStorage limit reached for courses:', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('LocalStorage error for user:', e);
    }
  }, [currentUser]);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  const uploadDocument = (doc: Document) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            documents: [doc, ...c.documents],
          };
        }
        return c;
      })
    );
  };

  const addCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    setActiveCourseId(newCourse.id);
  };

  const updateTopics = (newTopics: Topic[]) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            topics: newTopics,
          };
        }
        return c;
      })
    );
  };

  const recordQuizCompletion = (
    session: QuizSession,
    diagnosis: { examRiskScore: number; overallVerdict: string; topicDiagnoses: TopicDiagnosis[] }
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== activeCourseId) return c;

        // Update topics based on diagnosis
        const updatedTopics = c.topics.map((t) => {
          const diag = diagnosis.topicDiagnoses.find((d) => d.topicId === t.id || d.topicId === t.name);
          if (diag) {
            return {
              ...t,
              status: diag.status,
              masteryScore: diag.masteryScore,
              lastAssessed: new Date().toISOString(),
              questionsAttempted: t.questionsAttempted + 1,
              questionsCorrect: diag.status === 'strong' ? t.questionsCorrect + 1 : t.questionsCorrect,
              diagnosisReason: diag.diagnosisReason,
              identifiedMisconceptions: diag.identifiedMisconceptions,
              recommendedAction: diag.recommendedAction,
            };
          }
          return t;
        });

        // Tally statuses
        const weakCount = updatedTopics.filter((t) => t.status === 'weak').length;
        const mediumCount = updatedTopics.filter((t) => t.status === 'medium').length;
        const strongCount = updatedTopics.filter((t) => t.status === 'strong').length;
        const unassessedCount = updatedTopics.filter((t) => t.status === 'unassessed').length;

        const newGapReport: GapReport = {
          id: `gap-${Date.now()}`,
          courseId: c.id,
          createdAt: new Date().toISOString(),
          examRiskScore: diagnosis.examRiskScore,
          overallVerdict: diagnosis.overallVerdict,
          weakCount,
          mediumCount,
          strongCount,
          unassessedCount,
          topicDiagnoses: diagnosis.topicDiagnoses,
        };

        return {
          ...c,
          topics: updatedTopics,
          gapReport: newGapReport,
          quizHistory: [session, ...c.quizHistory],
        };
      })
    );
  };

  const setRevisionPlan = (plan: RevisionPlan) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            revisionPlan: plan,
          };
        }
        return c;
      })
    );
  };

  const togglePlanBlock = (dayNumber: number, blockId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== activeCourseId || !c.revisionPlan) return c;
        const updatedDays = c.revisionPlan.days.map((d) => {
          if (d.dayNumber !== dayNumber) return d;
          return {
            ...d,
            blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b)),
          };
        });
        return {
          ...c,
          revisionPlan: {
            ...c.revisionPlan,
            days: updatedDays,
          },
        };
      })
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_COURSES);
    localStorage.removeItem(STORAGE_KEY_USER);
    setCourses(INITIAL_COURSES);
    setCurrentUser(DEMO_PROFILES[0]);
    setActiveCourseId(INITIAL_COURSES[0].id);
    setActiveTab('diagnosis');
  };

  const loginUser = (email: string, name: string) => {
    const matchedDemo = demoProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matchedDemo) {
      setCurrentUser(matchedDemo);
      setActiveCourseId(matchedDemo.activeCourseId);
    } else {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role: 'student',
        avatar: '🎓',
        activeCourseId: courses[0]?.id || 'course-cs301',
        streakDays: 1,
      };
      setCurrentUser(newUser);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        demoProfiles,
        setCurrentUser,
        courses,
        activeCourseId,
        activeCourse,
        setActiveCourseId,
        activeTab,
        setActiveTab,
        uploadDocument,
        addCourse,
        updateTopics,
        recordQuizCompletion,
        setRevisionPlan,
        togglePlanBlock,
        resetAllData,
        loginUser,
        isGeneratingAI,
        setIsGeneratingAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
