import Navbar from '@/components/layout/Navbar';
import TabSwitcher from '@/components/layout/TabSwitcher';
import FileDropzone from '@/components/pdf/FileDropzone';
import FileList from '@/components/pdf/FileList';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />

      <Navbar />

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-4 animate-bounce">
            <Sparkles className="w-3 h-3" /> New: Lightning Fast PDF Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-outfit">
            The smarter way to <br />
            <span className="gradient-text">manage your PDFs</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Extract pages or merge multiple files in seconds. <br />
            Everything happens in your browser—fast and secure.
          </p>
        </header>

        <section className="space-y-8">
          <TabSwitcher />
          
          <div className="glass p-8 rounded-[32px] shadow-2xl shadow-indigo-500/5">
            <FileDropzone />
            <FileList />
          </div>
        </section>

        <footer className="mt-20 text-center space-y-4">
          <div className="flex items-center justify-center gap-8 grayscale opacity-50">
            <span className="text-sm font-semibold text-slate-500">TRUSTED BY DEVELOPERS WORLDWIDE</span>
          </div>
          <p className="text-slate-500 text-xs">
            © 2026 grabPDF. Designed for professionals. No files are uploaded to our servers.
          </p>
        </footer>
      </div>
    </main>
  );
}
