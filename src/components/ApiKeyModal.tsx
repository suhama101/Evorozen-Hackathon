/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(stored);
      setIsSaved(!!stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('GEMINI_API_KEY', trimmed);
      setIsSaved(true);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setIsSaved(false);
    }
    onSave();
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setIsSaved(false);
    onSave();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-[#13131a] border border-gray-800 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#7c6bff]" />
                <h3 className="font-bold text-white text-base">Key Configuration</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Explanatory banner */}
            <div className="mb-4 text-xs leading-relaxed text-gray-400 space-y-2 bg-[#0a0a0f] p-3.5 rounded-xl border border-gray-800/60">
              <div className="flex items-center gap-1.5 text-gray-300 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-[#7c6bff]" />
                Secure Key Injection
              </div>
              <p>
                To run and test this app instantly in Google AI Studio or other sandbox environments, you can temporarily paste your <strong>Gemini API Key</strong> here.
              </p>
              <p className="text-[#7c6bff]">
                Your key remains 100% private, sandbox-local, saved securely inside your browser's local storage context, and is never logged server-side.
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Gemini API Key (API secret)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Paste AQ.Ab8R... or AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-gray-800 focus:border-[#7c6bff]/60 focus:ring-1 focus:ring-[#7c6bff]/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-300 placeholder-gray-600 focus:outline-none transition-all"
                  />
                  {isSaved && (
                    <span className="absolute right-3.5 top-[11.5px] text-emerald-400 flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2">
                {isSaved ? (
                  <button
                    onClick={handleClear}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
                  >
                    Clear Saved Key
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Overrides standard local .env
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 hover:bg-gray-800 rounded-xl text-gray-400 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#7c6bff] hover:bg-[#6c59ff] rounded-xl text-white text-xs font-bold shadow-lg shadow-[#7c6bff]/20 cursor-pointer transition-all"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
