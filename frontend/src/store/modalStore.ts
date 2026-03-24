import { create } from 'zustand';

interface ModalState {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isForgotPasswordOpen: boolean;
  isPrivacyOpen: boolean;
  isTermsOpen: boolean;
  isSupportOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  openForgotPassword: () => void;
  closeForgotPassword: () => void;
  openPrivacy: () => void;
  closePrivacy: () => void;
  openTerms: () => void;
  closeTerms: () => void;
  openSupport: () => void;
  closeSupport: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginOpen: false,
  isRegisterOpen: false,
  isForgotPasswordOpen: false,
  isPrivacyOpen: false,
  isTermsOpen: false,
  isSupportOpen: false,
  openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false, isForgotPasswordOpen: false, isPrivacyOpen: false, isTermsOpen: false, isSupportOpen: false }),
  closeLogin: () => set({ isLoginOpen: false }),
  openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false, isForgotPasswordOpen: false, isPrivacyOpen: false, isTermsOpen: false, isSupportOpen: false }),
  closeRegister: () => set({ isRegisterOpen: false }),
  openForgotPassword: () => set({ isForgotPasswordOpen: true, isLoginOpen: false, isRegisterOpen: false, isPrivacyOpen: false, isTermsOpen: false, isSupportOpen: false }),
  closeForgotPassword: () => set({ isForgotPasswordOpen: false }),
  openPrivacy: () => set({ isPrivacyOpen: true }),
  closePrivacy: () => set({ isPrivacyOpen: false }),
  openTerms: () => set({ isTermsOpen: true }),
  closeTerms: () => set({ isTermsOpen: false }),
  openSupport: () => set({ isSupportOpen: true }),
  closeSupport: () => set({ isSupportOpen: false }),
}));
