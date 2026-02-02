import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    FileImage,
    FileText,
    Upload,
    Loader2,
    Download,
    Archive,
    X,
    ArrowRight,
    Image as ImageIcon,
    Trash2,
} from 'lucide-react';
import {
    pdfToImages,
    imagesToPdf,
    downloadAsZip,
    downloadImage,
    type ConvertedPage,
} from '../utils/converterUtils';

type ConvertMode = 'pdf-to-image' | 'image-to-pdf';
type LayoutType = 'single' | 'grid';

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

export function ConverterSection() {
    const [mode, setMode] = useState<ConvertMode>('pdf-to-image');
    const [isConverting, setIsConverting] = useState(false);

    // PDF to Image state
    const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
    const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);

    // Image to PDF state
    const [images, setImages] = useState<ImageFile[]>([]);
    const [layout, setLayout] = useState<LayoutType>('grid');
    const [pdfFileName, setPdfFileName] = useState('documento');

    // PDF to Image handlers
    const onDropPdf = useCallback(async (acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (!pdfFile) return;

        setSelectedPdf(pdfFile);
        setConvertedPages([]);
        setIsConverting(true);

        try {
            const pages = await pdfToImages(pdfFile);
            setConvertedPages(pages);
        } catch (error) {
            console.error('Error converting PDF:', error);
            alert('Erro ao converter PDF. Verifique o console para mais detalhes.');
        } finally {
            setIsConverting(false);
        }
    }, []);

    const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
        onDrop: onDropPdf,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleDownloadAllAsZip = async () => {
        if (convertedPages.length === 0) return;
        const name = selectedPdf?.name.replace('.pdf', '') || 'pages';
        await downloadAsZip(convertedPages, name);
    };

    // Image to PDF handlers
    const onDropImages = useCallback((acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map((file) => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
        onDrop: onDropImages,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    });

    const removeImage = (id: string) => {
        setImages((prev) => {
            const img = prev.find((i) => i.id === id);
            if (img) URL.revokeObjectURL(img.preview);
            return prev.filter((i) => i.id !== id);
        });
    };

    const clearAllImages = () => {
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
    };

    const handleGeneratePdf = async () => {
        if (images.length === 0) return;
        setIsConverting(true);

        try {
            const pdfBytes = await imagesToPdf(
                images.map((i) => ({ file: i.file, name: i.file.name })),
                layout
            );
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${pdfFileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
        } finally {
            setIsConverting(false);
        }
    };

    const resetPdfToImage = () => {
        setSelectedPdf(null);
        setConvertedPages([]);
    };

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="glass-card rounded-2xl p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Selecione o tipo de conversão</h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode('pdf-to-image')}
                        className={`flex flex-1 items-center justify-center gap-3 rounded-xl p-4 transition-all ${mode === 'pdf-to-image'
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">PDF</span>
                        <ArrowRight className="h-4 w-4" />
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-medium">Imagens</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode('image-to-pdf')}
                        className={`flex flex-1 items-center justify-center gap-3 rounded-xl p-4 transition-all ${mode === 'image-to-pdf'
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-medium">Imagens</span>
                        <ArrowRight className="h-4 w-4" />
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">PDF</span>
                    </motion.button>
                </div>
            </div>

            {/* Content based on mode */}
            <AnimatePresence mode="wait">
                {mode === 'pdf-to-image' ? (
                    <motion.div
                        key="pdf-to-image"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* PDF Upload */}
                        {!selectedPdf ? (
                            <div
                                {...getPdfRootProps()}
                                className={`glass-card cursor-pointer rounded-2xl p-10 text-center transition-all ${isPdfDragActive ? 'border-primary bg-primary/10' : 'hover:bg-white/5'
                                    }`}
                            >
                                <input {...getPdfInputProps()} />
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`rounded-full p-4 ${isPdfDragActive ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
                                        <Upload className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-white/90">
                                            {isPdfDragActive ? 'Solte o PDF aqui' : 'Arraste um PDF aqui'}
                                        </p>
                                        <p className="mt-1 text-sm text-white/50">ou clique para selecionar</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-red-500/20 p-2">
                                            <FileText className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{selectedPdf.name}</p>
                                            <p className="text-sm text-white/50">
                                                {convertedPages.length > 0
                                                    ? `${convertedPages.length} páginas extraídas`
                                                    : 'Convertendo...'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetPdfToImage}
                                        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Converting Loader */}
                        {isConverting && (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-3 text-white/60">Convertendo páginas...</span>
                            </div>
                        )}

                        {/* Converted Pages Grid */}
                        {convertedPages.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        Páginas Extraídas ({convertedPages.length})
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownloadAllAsZip}
                                        className="glass-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                                    >
                                        <Archive className="h-4 w-4" />
                                        Baixar tudo (ZIP)
                                    </motion.button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {convertedPages.map((page) => (
                                        <motion.div
                                            key={page.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                                        >
                                            <img
                                                src={page.dataUrl}
                                                alt={`Página ${page.pageNumber}`}
                                                className="aspect-[3/4] w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => downloadImage(page.dataUrl, `pagina-${page.pageNumber}.png`)}
                                                    className="rounded-full bg-white/20 p-3 backdrop-blur-sm"
                                                >
                                                    <Download className="h-5 w-5 text-white" />
                                                </motion.button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                Página {page.pageNumber}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="image-to-pdf"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Image Upload */}
                        <div
                            {...getImageRootProps()}
                            className={`glass-card cursor-pointer rounded-2xl p-10 text-center transition-all ${isImageDragActive ? 'border-primary bg-primary/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <input {...getImageInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                <div className={`rounded-full p-4 ${isImageDragActive ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
                                    <FileImage className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white/90">
                                        {isImageDragActive ? 'Solte as imagens aqui' : 'Arraste imagens aqui'}
                                    </p>
                                    <p className="mt-1 text-sm text-white/50">ou clique para selecionar (PNG, JPG, WebP)</p>
                                </div>
                            </div>
                        </div>

                        {/* Images Grid */}
                        {images.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        Imagens selecionadas ({images.length})
                                    </h3>
                                    <button
                                        onClick={clearAllImages}
                                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Limpar todas
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                    {images.map((img) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
                                        >
                                            <img
                                                src={img.preview}
                                                alt={img.file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={() => removeImage(img.id)}
                                                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3 text-white" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generate PDF Options */}
                        {images.length > 0 && (
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="mb-4 text-lg font-semibold text-white">Opções do PDF</h3>

                                <div className="mb-4 space-y-3">
                                    <label className="block text-sm text-white/60">Layout</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setLayout('single')}
                                            className={`flex-1 rounded-lg p-3 transition-all ${layout === 'single'
                                                ? 'bg-primary/20 text-primary ring-1 ring-primary'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">1 imagem por página</span>
                                        </button>
                                        <button
                                            onClick={() => setLayout('grid')}
                                            className={`flex-1 rounded-lg p-3 transition-all ${layout === 'grid'
                                                ? 'bg-primary/20 text-primary ring-1 ring-primary'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">4 imagens por página (2x2)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <input
                                        type="text"
                                        value={pdfFileName}
                                        onChange={(e) => setPdfFileName(e.target.value)}
                                        placeholder="Nome do arquivo"
                                        className="glass-input flex-1 rounded-xl px-4 py-3 text-sm"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleGeneratePdf}
                                        disabled={isConverting}
                                        className="glass-button flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-semibold text-white disabled:opacity-50"
                                    >
                                        {isConverting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Download className="h-5 w-5" />
                                        )}
                                        {isConverting ? 'Gerando...' : 'Gerar PDF'}
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
