import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileUp } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';

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
        <motion.div
            {...getRootProps()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`
                relative cursor-pointer rounded-xl border-2 border-dashed p-10 transition-all
                ${isDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                }
            `}
        >
            <input {...getInputProps()} />

            {/* Glow effect on drag */}
            {isDragActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20"
                />
            )}

            <div className="relative flex flex-col items-center justify-center gap-4 text-center">
                <motion.div
                    animate={isDragActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                    className={`
                        rounded-full p-4 transition-colors
                        ${isDragActive
                            ? 'bg-gradient-to-br from-primary to-secondary text-white'
                            : 'bg-white/10 text-white/60'
                        }
                    `}
                >
                    {isDragActive ? (
                        <FileUp className="h-8 w-8" />
                    ) : (
                        <Upload className="h-8 w-8" />
                    )}
                </motion.div>
                <div>
                    <p className="text-lg font-medium text-white/90">
                        {isDragActive ? "Solte os arquivos aqui" : "Arraste e solte arquivos aqui"}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                        ou clique para selecionar (Imagens e PDF)
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
