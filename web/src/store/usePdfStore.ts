import { create } from 'zustand';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  totalPages?: number;
  previewUrl?: string;
}

interface PdfState {
  files: PdfFile[];
  activeTab: 'extract' | 'merge';
  isProcessing: boolean;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setActiveTab: (tab: 'extract' | 'merge') => void;
  setProcessing: (status: boolean) => void;
}

export const usePdfStore = create<PdfState>((set) => ({
  files: [],
  activeTab: 'extract',
  isProcessing: false,
  addFiles: (newFiles) => set((state) => {
    const mappedFiles = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
    }));
    return { files: [...state.files, ...mappedFiles] };
  }),
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id)
  })),
  clearFiles: () => set({ files: [] }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setProcessing: (status) => set({ isProcessing: status }),
}));
