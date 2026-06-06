/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoleId, QuestionData } from './types';
import RoleSelection from './components/RoleSelection';
import InterviewFlow from './components/InterviewFlow';
import ResultsView from './components/ResultsView';
import ApiKeyModal from './components/ApiKeyModal';
import { Compass, GraduationCap, Key } from 'lucide-react';

export default function App() {
  const [path, setPath] = useState<'/' | '/interview' | '/results'>('/');
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<QuestionData[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [hasLocalKey, setHasLocalKey] = useState<boolean>(false);

  useEffect(() => {
    setHasLocalKey(!!localStorage.getItem('GEMINI_API_KEY'));
  }, []);

  const handleKeySaved = () => {
    setHasLocalKey(!!localStorage.getItem('GEMINI_API_KEY'));
  };

  const handleSelectRole = (roleId: RoleId) => {
    setSelectedRoleId(roleId);
    setCompletedQuestions([]);
    setPath('/interview');
  };

  const handleInterviewComplete = (questions: QuestionData[]) => {
    setCompletedQuestions(questions);
    setPath('/results');
  };

  const handleRestart = () => {
    setSelectedRoleId(null);
    setCompletedQuestions([]);
    setPath('/');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 antialiased font-sans pb-16">
      {/* Dynamic Global Top Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur border-b border-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c6bff] to-[#6351f0] flex items-center justify-center text-[#0a0a0f] font-bold shadow-md shadow-[#7c6bff]/10">
              <GraduationCap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider text-white">
                INTERVIEW<span className="text-[#7c6bff]">COACH</span>
              </span>
              <span className="text-[9px] text-[#7c6bff] uppercase font-bold tracking-widest block -mt-0.5">
                Next-Gen Simulator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* API Key Status / Configuration Trigger */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800/60 bg-gray-900/60 hover:bg-gray-800/50 text-xs font-semibold cursor-pointer transition-all hover:border-[#7c6bff]/40"
              title="Open Gemini Key Configuration panel"
            >
              <Key className="w-3 h-3 text-[#7c6bff]" />
              <div className={`w-1.5 h-1.5 rounded-full ${hasLocalKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse'}`} />
              <span className="text-[9px] font-mono tracking-wider uppercase text-gray-300">
                {hasLocalKey ? 'Key: Local Active' : 'Configure Key'}
              </span>
            </button>

            {/* Status indicator pill showing active route representation */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800/50">
              <Compass className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">
                {path === '/' ? 'Home selection' : path === '/interview' ? 'Mock Stage' : 'Audit Summary'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Key Manager Overlay Fallback */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSave={handleKeySaved}
      />

      {/* Main Container with Screen Router */}
      <main className="max-w-5xl mx-auto pt-4">
        <AnimatePresence mode="wait">
          {path === '/' && (
            <motion.div
              key="selection"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <RoleSelection onSelectRole={handleSelectRole} />
            </motion.div>
          )}

          {path === '/interview' && selectedRoleId && (
            <motion.div
              key="interview"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <InterviewFlow
                roleId={selectedRoleId}
                onInterviewComplete={handleInterviewComplete}
                onExit={handleRestart}
              />
            </motion.div>
          )}

          {path === '/results' && selectedRoleId && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <ResultsView
                roleId={selectedRoleId}
                questions={completedQuestions}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
