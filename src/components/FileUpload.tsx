import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { cn } from '../lib/utils';

export function FileUpload() {
    const addFiles = useFileStore((state) => state.addFiles);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        addFiles(acceptedFiles);
    }, [addFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'application/pdf': [],
        },
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-10 transition-all hover:border-blue-500 hover:bg-blue-50/50",
                isDragActive && "border-blue-500 bg-blue-50"
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-blue-100 p-4 text-blue-600">
                    {isDragActive ? (
                        <FileUp className="h-8 w-8 animate-bounce" />
                    ) : (
                        <Upload className="h-8 w-8" />
                    )}
                </div>
                <div>
                    <p className="text-lg font-medium text-slate-700">
                        {isDragActive ? "Solte os arquivos aqui" : "Arraste e solte arquivos aqui"}
                    </p>
                    <p className="text-sm text-slate-500">
                        ou clique para selecionar (Imagens e PDF)
                    </p>
                </div>
            </div>
        </div>
    );
}
