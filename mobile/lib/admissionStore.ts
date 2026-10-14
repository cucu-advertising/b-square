import { create } from 'zustand';
import type { AdmissionStatus } from './admission';

type VerificationMethod = 'linkedin' | 'work_email' | 'registry' | 'referral' | '';

type AdmissionState = {
  roleTitle: string;
  workEmail: string;
  companyWebsite: string;
  linkedinUrl: string;
  verificationMethod: VerificationMethod;
  admissionScore: number;
  admissionStatus: AdmissionStatus | null;
  admissionReasons: string[];
  setRoleTitle: (value: string) => void;
  setWorkEmail: (value: string) => void;
  setCompanyWebsite: (value: string) => void;
  setLinkedinUrl: (value: string) => void;
  setVerificationMethod: (value: VerificationMethod) => void;
  setAdmissionResult: (score: number, status: AdmissionStatus, reasons: string[]) => void;
};

export const useAdmissionStore = create<AdmissionState>((set) => ({
  roleTitle: '',
  workEmail: '',
  companyWebsite: '',
  linkedinUrl: '',
  verificationMethod: '',
  admissionScore: 0,
  admissionStatus: null,
  admissionReasons: [],
  setRoleTitle: (roleTitle) => set({ roleTitle }),
  setWorkEmail: (workEmail) => set({ workEmail }),
  setCompanyWebsite: (companyWebsite) => set({ companyWebsite }),
  setLinkedinUrl: (linkedinUrl) => set({ linkedinUrl }),
  setVerificationMethod: (verificationMethod) => set({ verificationMethod }),
  setAdmissionResult: (admissionScore, admissionStatus, admissionReasons) =>
    set({ admissionScore, admissionStatus, admissionReasons }),
}));
