import { create } from 'zustand';

interface UIState {
  activeDrawer: 'quickView' | 'filters' | 'form' | 'module' | 'lesson' | null;
  activeCourseId: string | null;
  activeModuleId: string | null;
  activeLessonId: string | null;
  isFiltersOpen: boolean;
  confirmDialogState: {
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'delete' | 'archive' | 'unpublish' | 'bulkDelete' | 'bulkArchive' | null;
    payload?: any;
  };
  openDrawer: (drawer: UIState['activeDrawer'], courseId?: string | null) => void;
  closeDrawer: () => void;
  setFiltersOpen: (isOpen: boolean) => void;
  openConfirmDialog: (config: Omit<UIState['confirmDialogState'], 'isOpen'>) => void;
  closeConfirmDialog: () => void;
  setActiveModule: (moduleId: string | null) => void;
  setActiveLesson: (lessonId: string | null) => void;
}

export const useCourseUIStore = create<UIState>((set) => ({
  activeDrawer: null,
  activeCourseId: null,
  activeModuleId: null,
  activeLessonId: null,
  isFiltersOpen: false,
  confirmDialogState: {
    isOpen: false,
    title: '',
    description: '',
    actionType: null,
  },

  openDrawer: (drawer, courseId = null) =>
    set({
      activeDrawer: drawer,
      activeCourseId: courseId,
    }),

  closeDrawer: () =>
    set({
      activeDrawer: null,
    }),

  setFiltersOpen: (isOpen) => set({ isFiltersOpen: isOpen }),

  openConfirmDialog: (config) =>
    set({
      confirmDialogState: {
        isOpen: true,
        ...config,
      },
    }),

  closeConfirmDialog: () =>
    set((state) => ({
      confirmDialogState: {
        ...state.confirmDialogState,
        isOpen: false,
      },
    })),

  setActiveModule: (moduleId) => set({ activeModuleId: moduleId }),
  setActiveLesson: (lessonId) => set({ activeLessonId: lessonId }),
}));

interface SelectionState {
  selectedCourseIds: string[];
  selectRow: (id: string) => void;
  unselectRow: (id: string) => void;
  toggleRow: (id: string) => void;
  toggleAllPage: (pageIds: string[]) => void;
  clearSelection: () => void;
}

export const useCourseSelectionStore = create<SelectionState>((set, get) => ({
  selectedCourseIds: [],

  selectRow: (id) =>
    set((state) => ({
      selectedCourseIds: state.selectedCourseIds.includes(id)
        ? state.selectedCourseIds
        : [...state.selectedCourseIds, id],
    })),

  unselectRow: (id) =>
    set((state) => ({
      selectedCourseIds: state.selectedCourseIds.filter((item) => item !== id),
    })),

  toggleRow: (id) => {
    const { selectedCourseIds } = get();
    if (selectedCourseIds.includes(id)) {
      set({ selectedCourseIds: selectedCourseIds.filter((item) => item !== id) });
    } else {
      set({ selectedCourseIds: [...selectedCourseIds, id] });
    }
  },

  toggleAllPage: (pageIds) => {
    const { selectedCourseIds } = get();
    const allSelected = pageIds.every((id) => selectedCourseIds.includes(id));
    if (allSelected) {
      set({ selectedCourseIds: selectedCourseIds.filter((id) => !pageIds.includes(id)) });
    } else {
      const merged = Array.from(new Set([...selectedCourseIds, ...pageIds]));
      set({ selectedCourseIds: merged });
    }
  },

  clearSelection: () => set({ selectedCourseIds: [] }),
}));
