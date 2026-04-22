import { create } from "zustand";

interface AppState {
  // Sidebar State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Active Contexts
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;

  // Global UI Overlays
  isVideoCallActive: boolean;
  activeVideoAppointmentId: string | null;
  startVideoCall: (appointmentId: string) => void;
  endVideoCall: () => void;

  // Quick Action Modal
  isQuickActionModalOpen: boolean;
  toggleQuickActionModal: () => void;

  // Global Search
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state: AppState) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),

  // Patient Context
  activePatientId: null,
  setActivePatientId: (id: string | null) => set({ activePatientId: id }),

  // Video Call
  isVideoCallActive: false,
  activeVideoAppointmentId: null,
  startVideoCall: (appointmentId: string) =>
    set({ isVideoCallActive: true, activeVideoAppointmentId: appointmentId }),
  endVideoCall: () =>
    set({ isVideoCallActive: false, activeVideoAppointmentId: null }),

  // Quick Actions
  isQuickActionModalOpen: false,
  toggleQuickActionModal: () =>
    set((state: AppState) => ({ isQuickActionModalOpen: !state.isQuickActionModalOpen })),

  // Global Search
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
