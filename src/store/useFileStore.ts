import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
    id: string;
    file: File;
    preview: string; // URL for preview (blob or icon)
    type: 'image' | 'pdf';
    name: string;
}

interface FileStore {
    files: UploadedFile[];
    addFiles: (newFiles: File[]) => void;
    removeFile: (id: string) => void;
    reorderFiles: (newOrder: UploadedFile[]) => void;
    clearFiles: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
    files: [],
    addFiles: (newFiles) => {
        const processedFiles = newFiles.map((file) => ({
            id: uuidv4(),
            file,
            preview: URL.createObjectURL(file),
            type: file.type.includes('pdf') ? 'pdf' : 'image' as 'image' | 'pdf',
            name: file.name,
        }));
        set((state) => ({ files: [...state.files, ...processedFiles] }));
    },
    removeFile: (id) => set((state) => {
        const fileToRemove = state.files.find(f => f.id === id);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        return { files: state.files.filter((f) => f.id !== id) };
    }),
    reorderFiles: (newOrder) => set({ files: newOrder }),
    clearFiles: () => set((state) => {
        state.files.forEach(f => URL.revokeObjectURL(f.preview));
        return { files: [] };
    }),
}));
