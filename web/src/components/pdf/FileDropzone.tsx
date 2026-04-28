'use client';

import { usePdfStore } from '@/store/usePdfStore';
import { Upload, FileUp } from 'lucide-react';
import { useCallback, useState } from 'react';

export default function FileDropzone() {
  const addFiles = usePdfStore((state) => state.addFiles);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      addFiles(files);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden
        ${isDragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'}`}
    >
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={onFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      
      <div className="py-16 px-8 flex flex-col items-center justify-center text-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
          ${isDragging ? 'bg-indigo-500 text-white rotate-0' : 'bg-white/5 text-slate-400 group-hover:scale-110 group-hover:text-indigo-400'}`}>
          <Upload className="w-8 h-8" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-1">Click or drag PDF files here</h3>
          <p className="text-slate-400 text-sm">Upload one or more PDFs to start extracting or merging</p>
        </div>

        <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400 group-hover:text-slate-300 group-hover:border-white/20 transition-all">
          <FileUp className="w-3.5 h-3.5" />
          Supports files up to 50MB
        </div>
      </div>

      {/* Decorative Gradients */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] pointer-events-none" />
    </div>
  );
}
