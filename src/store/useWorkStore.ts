import { create } from 'zustand';
import type { Work, TeasePage, TeaseButton } from '@/types';
import { generateWorkId } from '@/utils/idGenerator';
import { saveWork as persistWork } from '@/utils/storage';

interface WorkState {
  currentWork: Work;

  // 当前正在编辑的页面ID
  editingPageId: string | null;

  // 更新作品标题
  setTitle: (title: string) => void;

  // 更新作者姓名
  setAuthor: (author: string) => void;

  // ====== 页面操作 ======

  addPage: () => string;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<TeasePage>) => void;
  setEditingPage: (pageId: string | null) => void;
  movePage: (pageId: string, direction: 'up' | 'down') => void;

  // ====== 文字行操作 ======

  addTextLine: (pageId: string, content?: string) => void;
  updateTextLine: (pageId: string, index: number, content: string) => void;
  deleteTextLine: (pageId: string, index: number) => void;
  moveTextLine: (pageId: string, index: number, direction: 'up' | 'down') => void;

  // ====== 按钮操作 ======

  addButton: (pageId: string) => void;
  updateButton: (pageId: string, buttonId: string, updates: Partial<TeaseButton>) => void;
  deleteButton: (pageId: string, buttonId: string) => void;

  // ====== 作品操作 ======

  loadWork: (work: Work) => void;
  createNewWork: () => void;
  persist: () => void;
}

const defaultWork: Work = {
  id: '',
  title: '',
  author: '',
  pages: [],
  startPageId: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useWorkStore = create<WorkState>((set, get) => ({
  currentWork: { ...defaultWork },
  editingPageId: null,

  setTitle: (title) =>
    set((state) => ({
      currentWork: { ...state.currentWork, title, updatedAt: Date.now() },
    })),

  setAuthor: (author) =>
    set((state) => ({
      currentWork: { ...state.currentWork, author, updatedAt: Date.now() },
    })),

  addPage: () => {
    const id = `page_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();
    const newPage: TeasePage = {
      id,
      imageUrl: '',
      textLines: ['输入第一条文字...'],
      buttons: [],
      order: now,
    };

    set((state) => {
      const updatedPages = [...state.currentWork.pages, newPage];
      const isFirst = updatedPages.length === 1;
      return {
        currentWork: {
          ...state.currentWork,
          pages: updatedPages,
          startPageId: isFirst ? id : state.currentWork.startPageId,
          updatedAt: now,
        },
        editingPageId: id,
      };
    });
    return id;
  },

  deletePage: (pageId) =>
    set((state) => {
      const filtered = state.currentWork.pages.filter((p) => p.id !== pageId);
      let newStartId = state.currentWork.startPageId;
      if (pageId === state.currentWork.startPageId && filtered.length > 0) {
        newStartId = filtered[0].id;
      }
      return {
        currentWork: {
          ...state.currentWork,
          pages: filtered,
          startPageId: newStartId,
          updatedAt: Date.now(),
        },
        editingPageId:
          state.editingPageId === pageId ? null : state.editingPageId,
      };
    }),

  duplicatePage: (pageId) => {
    const state = get();
    const source = state.currentWork.pages.find((p) => p.id === pageId);
    if (!source) return;

    const id = `page_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newPage: TeasePage = {
      ...source,
      id,
      textLines: [...source.textLines],
      buttons: source.buttons.map((b) => ({
        ...b,
        id: `btn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      })),
      order: Date.now(),
    };

    set((s) => ({
      currentWork: {
        ...s.currentWork,
        pages: [...s.currentWork.pages, newPage],
        updatedAt: Date.now(),
      },
      editingPageId: id,
    }));
  },

  updatePage: (pageId, updates) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) =>
          p.id === pageId ? { ...p, ...updates } : p
        ),
        updatedAt: Date.now(),
      },
    })),

  setEditingPage: (pageId) => set({ editingPageId: pageId }),

  movePage: (pageId, direction) =>
    set((state) => {
      const pages = [...state.currentWork.pages];
      const index = pages.findIndex((p) => p.id === pageId);
      if (index < 0) return state;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= pages.length) return state;

      [pages[index], pages[swapIndex]] = [pages[swapIndex], pages[index]];
      return {
        currentWork: { ...state.currentWork, pages, updatedAt: Date.now() },
      };
    }),

  // ====== 文字行操作 ======

  addTextLine: (pageId, content) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) =>
          p.id === pageId
            ? { ...p, textLines: [...p.textLines, content ?? '输入文字内容...'] }
            : p
        ),
        updatedAt: Date.now(),
      },
    })),

  updateTextLine: (pageId, index, lineContent) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) => {
          if (p.id !== pageId) return p;
          const lines = [...p.textLines];
          if (index >= 0 && index < lines.length) {
            lines[index] = lineContent;
          }
          return { ...p, textLines: lines };
        }),
        updatedAt: Date.now(),
      },
    })),

  deleteTextLine: (pageId, index) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) => {
          if (p.id !== pageId) return p;
          const lines = p.textLines.filter((_, i) => i !== index);
          return { ...p, textLines: lines };
        }),
        updatedAt: Date.now(),
      },
    })),

  moveTextLine: (pageId, index, direction) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) => {
          if (p.id !== pageId) return p;
          const lines = [...p.textLines];
          const swapIdx = direction === 'up' ? index - 1 : index + 1;
          if (swapIdx < 0 || swapIdx >= lines.length) return p;
          [lines[index], lines[swapIdx]] = [lines[swapIdx], lines[index]];
          return { ...p, textLines: lines };
        }),
        updatedAt: Date.now(),
      },
    })),

  // ====== 按钮操作 ======

  addButton: (pageId) => {
    const btnId = `btn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newBtn: TeaseButton = {
      id: btnId,
      text: '继续',
      targetPageId: '',
    };

    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) =>
          p.id === pageId ? { ...p, buttons: [...p.buttons, newBtn] } : p
        ),
        updatedAt: Date.now(),
      },
    }));
  },

  updateButton: (pageId, buttonId, updates) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) =>
          p.id === pageId
            ? {
                ...p,
                buttons: p.buttons.map((b) =>
                  b.id === buttonId ? { ...b, ...updates } : b
                ),
              }
            : p
        ),
        updatedAt: Date.now(),
      },
    })),

  deleteButton: (pageId, buttonId) =>
    set((state) => ({
      currentWork: {
        ...state.currentWork,
        pages: state.currentWork.pages.map((p) =>
          p.id === pageId
            ? { ...p, buttons: p.buttons.filter((b) => b.id !== buttonId) }
            : p
        ),
        updatedAt: Date.now(),
      },
    })),

  loadWork: (work) =>
    set({
      currentWork: work,
      editingPageId: work.pages.length > 0 ? work.pages[0].id : null,
    }),

  createNewWork: () =>
    set({
      currentWork: {
        ...defaultWork,
        id: generateWorkId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      editingPageId: null,
    }),

  persist: () => {
    const { currentWork } = get();
    persistWork(currentWork);
  },
}));
