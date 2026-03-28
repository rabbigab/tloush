import { create } from "zustand";
import type { AppState, AppStep, PayrollDocument, UserContext, FinalReport } from "@/types";

const DEFAULT_USER_CONTEXT: UserContext = {
  payType: "unknown", startDate: null, workTime: "unknown", salaryType: "unknown",
  hasContract: null, isFirstPayslip: null, tookVacation: null, vacationDays: null,
  wasSick: null, sickDays: null, hasMedicalCertificate: null, hadUnpaidLeave: null,
  didOvertime: null, workedHoliday: null, gotBonus: null, moreThanOneYear: null,
  hasPensionViaEmployer: null, receivesRegularAllowances: null, postOrHoursChanged: null,
  hadIncompleteMonth: null, hasTimesheet: null, hasPreviousPayslips: null, hasPensionStatement: null,
};

export const useAnalysisStore = create<AppState>((set) => ({
  currentStep: "landing",
  uploadedFile: null,
  payrollDocument: null,
  userContext: { ...DEFAULT_USER_CONTEXT },
  finalReport: null,
  setStep: (step: AppStep) => set({ currentStep: step }),
  setUploadedFile: (file: File | null) => set({ uploadedFile: file }),
  setPayrollDocument: (doc: PayrollDocument) => set({ payrollDocument: doc }),
  updateUserContext: (partial: Partial<UserContext>) => set((state) => ({ userContext: { ...state.userContext, ...partial } })),
  setFinalReport: (report: FinalReport) => set({ finalReport: report }),
  resetAll: () => set({ currentStep: "landing", uploadedFile: null, payrollDocument: null, userContext: { ...DEFAULT_USER_CONTEXT }, finalReport: null }),
}));
