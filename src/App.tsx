import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { ConverterSection } from './components/ConverterSection';
import { useFileStore } from './store/useFileStore';
import { generatePDF } from './utils/pdfGenerator';
import { Loader2, Download, FileCheck, Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';

type TabType = 'prestacao' | 'converter';

function App() {
  const files = useFileStore((state) => state.files);
  const clearFiles = useFileStore((state) => state.clearFiles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileName, setFileName] = useState(`prestacao-de-contas-${new Date().toISOString().split('T')[0]}`);
  const [activeTab, setActiveTab] = useState<TabType>('prestacao');

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    try {
      const pdfBytes = await generatePDF(files);
      const blob = new Blob([pdfBytes as Uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Animated mesh background */}
      <div className="mesh-background" />

      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative rounded-xl bg-gradient-to-br from-primary to-secondary p-3 shadow-glow"
                >
                  <FileCheck className="h-8 w-8 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </motion.div>
                </motion.div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold sm:text-3xl">
                    Prestação de Contas
                  </h1>
                  <p className="mt-1 text-sm text-white/60">
                    Organize comprovantes e converta documentos
                  </p>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <button
              onClick={() => setActiveTab('prestacao')}
              className={`tab-button flex items-center gap-2 ${activeTab === 'prestacao' ? 'active' : ''}`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Prestação de Contas</span>
            </button>
            <button
              onClick={() => setActiveTab('converter')}
              className={`tab-button flex items-center gap-2 ${activeTab === 'converter' ? 'active' : ''}`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Conversor</span>
            </button>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'prestacao' ? (
              <motion.main
                key="prestacao"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Upload Section */}
                <section className="glass-card rounded-2xl p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white">Upload de Arquivos</h2>
                  </div>
                  <FileUpload />
                </section>

                {/* File List Section */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="glass-card rounded-2xl p-6 sm:p-8"
                    >
                      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                            <span className="text-sm font-bold">2</span>
                          </div>
                          <h2 className="text-lg font-semibold text-white">Organizar Arquivos</h2>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/70">
                            {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover todos os arquivos?')) {
                              clearFiles();
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Limpar todos
                        </motion.button>
                      </div>
                      <p className="mb-4 text-sm text-white/50">
                        Arraste os itens para reordenar a sequência do PDF final.
                      </p>
                      <FileList />
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Generate Section */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="glass-card rounded-2xl p-6 sm:p-8"
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                          <span className="text-sm font-bold">3</span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">Gerar PDF</h2>
                      </div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="Nome do arquivo"
                          className="glass-input flex-1 rounded-xl px-4 py-3 text-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerate}
                          disabled={files.length === 0 || isGenerating}
                          className="glass-button flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
                        </motion.button>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.main>
            ) : (
              <motion.main
                key="converter"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ConverterSection />
              </motion.main>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default App;
