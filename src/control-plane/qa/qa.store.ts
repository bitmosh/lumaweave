import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QaCheckResult, QaFeatureSubmission, BanditAdvisorySection } from "./qa.types";

interface QaState {
  resultsByChecklist: Record<string, Record<string, QaCheckResult>>;
  submissionHistory: QaFeatureSubmission[];
  advisoryByChecklist: Record<string, BanditAdvisorySection>;
  
  setCheckResult: (checklistKey: string, checkId: string, result: QaCheckResult) => void;
  setFeatureSubmission: (submission: QaFeatureSubmission) => void;
  resetChecklistResults: (checklistKey: string) => void;
  resetAll: () => void;
  getLastSubmission: () => QaFeatureSubmission | null;
  getSubmissionsByFeatureId: (featureId: string) => QaFeatureSubmission[];
  setAdvisorySection: (checklistKey: string, advisory: BanditAdvisorySection) => void;
  getAdvisorySection: (checklistKey: string) => BanditAdvisorySection | null;
}

export const useQaStore = create<QaState>()(
  persist(
    (set, get) => ({
      resultsByChecklist: {},
      submissionHistory: [],
      advisoryByChecklist: {},
      
      setCheckResult: (checklistKey, checkId, result) =>
        set((state) => ({
          resultsByChecklist: {
            ...state.resultsByChecklist,
            [checklistKey]: {
              ...state.resultsByChecklist[checklistKey],
              [checkId]: result,
            },
          },
        })),
      
      setFeatureSubmission: (submission) =>
        set((state) => ({
          submissionHistory: [...state.submissionHistory, submission],
        })),
      
      resetChecklistResults: (checklistKey) =>
        set((state) => {
          const newResultsByChecklist = { ...state.resultsByChecklist };
          delete newResultsByChecklist[checklistKey];
          return { resultsByChecklist: newResultsByChecklist };
        }),
      
      resetAll: () => set({ resultsByChecklist: {}, submissionHistory: [], advisoryByChecklist: {} }),
      
      getLastSubmission: () => {
        const history = get().submissionHistory;
        return history.length > 0 ? history[history.length - 1] : null;
      },
      
      getSubmissionsByFeatureId: (featureId) => {
        const history = get().submissionHistory;
        return history.filter((s) => s.featureId === featureId);
      },

      setAdvisorySection: (checklistKey, advisory) =>
        set((state) => ({
          advisoryByChecklist: {
            ...state.advisoryByChecklist,
            [checklistKey]: advisory,
          },
        })),

      getAdvisorySection: (checklistKey) => {
        const advisory = get().advisoryByChecklist[checklistKey];
        return advisory || null;
      },
    }),
    {
      name: "lumaweave-qa-storage",
    }
  )
);
