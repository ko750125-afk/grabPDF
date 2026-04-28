'use client';

import { usePdfStore } from '@/store/usePdfStore';
import { FileText, X, Trash2, Scissors, Combine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { extractPdfPages, mergePdfs, downloadBlob } from '@/lib/pdf-utils';

export default function FileList() {
  const { files, removeFile, activeTab, clearFiles, setProcessing, isProcessing } = usePdfStore();
  const [pageRange, setPageRange] = useState('');

  const handleAction = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    try {
      if (activeTab === 'extract') {
        if (!pageRange) throw new Error("페이지 범위를 입력해주세요.");
        const result = await extractPdfPages(files[0].file, pageRange);
        downloadBlob(result, `extracted_${files[0].name}`);
      } else {
        const result = await mergePdfs(files.map(f => f.file));
        downloadBlob(result, `merged_document.pdf`);
      }
    } catch (error: any) {
      alert(error.message || "작업 중 오류가 발생했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          Selected Files <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{files.length}</span>
        </h4>
        <button onClick={clearFiles} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
          <Trash2 className="w-3 h-3" /> Clear All
        </button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-4 rounded-2xl flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div className="pt-6 border-t border-white/5 space-y-6">
        {activeTab === 'extract' ? (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">Page Range (e.g., 1, 3, 5-10)</label>
            <input
              type="text"
              placeholder="Enter pages to extract..."
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="w-full input-field py-4 text-lg"
            />
            <p className="text-[10px] text-slate-500">Use commas for multiple pages and hyphens for ranges.</p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
            <p className="text-sm text-indigo-300">Files will be merged in the order shown above.</p>
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={isProcessing}
          className={`w-full btn-primary py-5 text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <>
              {activeTab === 'extract' ? <Scissors className="w-5 h-5" /> : <Combine className="w-5 h-5" />}
              {activeTab === 'extract' ? 'Extract & Download' : 'Merge & Download'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
