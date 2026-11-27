import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export default function ToastBanner() {
  const { toast, dismissToast } = useStudio();

  return (
    <div className="fixed bottom-6 right-6 z-[70] max-w-md w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
              toast.type === 'error'
                ? 'bg-[#1f1215]/95 border-rose-500/40 text-rose-100'
                : 'bg-[#15151a]/95 border-[#d4af37]/45 text-[#f5f2eb]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#e8cd8b] shrink-0 mt-0.5" />
            )}
            <p className="text-sm leading-snug flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={dismissToast}
              className="text-white/50 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
