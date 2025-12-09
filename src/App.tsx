import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { useFileStore } from './store/useFileStore';
import { generatePDF } from './utils/pdfGenerator';
import { Loader2, Download, FileCheck } from 'lucide-react';

function App() {
  const files = useFileStore((state) => state.files);
  const clearFiles = useFileStore((state) => state.clearFiles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileName, setFileName] = useState(`prestacao-de-contas-${new Date().toISOString().split('T')[0]}`);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    try {
      const pdfBytes = await generatePDF(files);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <FileCheck className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Prestação de Contas</h1>
            </div>
            <p className="mt-2 text-slate-500">
              Organize seus comprovantes e gere um PDF único para envio.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Nome do arquivo"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleGenerate}
                disabled={files.length === 0 || isGenerating}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                {isGenerating ? 'Gerando...' : 'Gerar PDF'}
              </button>
            </div>
            {files.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja remover todos os arquivos?')) {
                    clearFiles();
                  }
                }}
                className="text-sm text-red-500 hover:text-red-700 hover:underline"
              >
                Limpar todos os arquivos
              </button>
            )}
          </div>
        </header>

        <main className="space-y-6">
          <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">1. Upload de Arquivos</h2>
            <FileUpload />
          </section>

          {files.length > 0 && (
            <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">2. Organizar Arquivos</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Arraste os itens para reordenar a sequência do PDF final.
              </p>
              <FileList />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
