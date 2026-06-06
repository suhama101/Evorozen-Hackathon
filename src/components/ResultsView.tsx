/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QuestionData, RoleId, ROLES } from '../types';
import LoadingIndicator from './LoadingIndicator';
import { Award, ChevronDown, ChevronUp, FileText, RefreshCw, Star, TrendingUp, AlertTriangle } from 'lucide-react';

interface ResultsViewProps {
  roleId: RoleId;
  questions: QuestionData[];
  onRestart: () => void;
}

export default function ResultsView({ roleId, questions, onRestart }: ResultsViewProps) {
  const currentRole = ROLES.find((r) => r.id === roleId);
  const roleName = currentRole ? currentRole.title : 'Technical Candidate';

  const [overallFeedback, setOverallFeedback] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Accordion state for accordion breakdown
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  const getOverallFeedback = async () => {
    setLoadingSummary(true);
    setErrorMsg(null);

    const questionsWithScores = questions
      .map((q) => `Question ${q.number}: "${q.questionText}" - Checked Score: ${q.score}/10`)
      .join('\n');

    const prompt = `Candidate completed a mock ${roleName} interview. Questions and scores: ${questionsWithScores}. Total: ${totalScore}/50. Give 3-4 sentences: strongest area, biggest area to improve, one actionable study tip. Be encouraging but honest.`;

    try {
      const localKey = localStorage.getItem('GEMINI_API_KEY') || '';
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(localKey ? { 'x-gemini-key': localKey } : {})
        },
        body: JSON.stringify({ prompt }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        if (!response.ok) {
          throw new Error(`Failed to generate final report (HTTP ${response.status})`);
        }
        throw jsonErr;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Failed to generate final report (HTTP ${response.status})`);
      }

      setOverallFeedback(data.text || 'Excellent job completing your technical challenge! Keep practicing your backend logic.');
    } catch (err: any) {
      console.error('Error in overall feedback generation:', err);
      setErrorMsg(err.message || 'Unable to fetch professional executive feedback. Standard scorecard generated below.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    getOverallFeedback();
  }, [roleId]);

  const toggleAccordion = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // Performance Rating String
  const getPerformanceLabel = (score: number) => {
    if (score >= 42) return { text: 'Expert Level', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' };
    if (score >= 35) return { text: 'Proficient Level', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' };
    if (score >= 25) return { text: 'Competent Level', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
    return { text: 'Developing Level', color: 'text-rose-400 border-rose-500/30 bg-rose-500/5' };
  };

  const performance = getPerformanceLabel(totalScore);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Decorative Top Frame */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-[#7c6bff] uppercase bg-[#7c6bff]/10 rounded-full border border-[#7c6bff]/20">
            Mock Transcript Compiled
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            Interview scorecard
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Review detailed metrics, answers and constructive advice for <span className="text-gray-100 font-semibold">{roleName}</span>.
          </p>
        </motion.div>
      </div>

      {/* Main Score & Core Advice Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Score Circle card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 bg-[#13131a] rounded-2xl border border-gray-800/80 p-6 flex flex-col items-center justify-center text-center shadow-lg"
        >
          <Award className="w-8 h-8 text-[#7c6bff] mb-3" />
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">
            AGGREGATE SCORE
          </span>
          <div className="flex items-baseline mb-2">
            <span className="text-5xl font-black text-white">{totalScore}</span>
            <span className="text-gray-500 font-medium ml-1">/ 50</span>
          </div>

          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${performance.color} mt-2`}>
            {performance.text}
          </span>
        </motion.div>

        {/* Executive Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-[#13131a] rounded-2xl border border-gray-800/80 p-6 flex flex-col justify-center min-h-[170px]"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#7c6bff]" />
            <h3 className="text-xs font-bold text-[#7c6bff] uppercase tracking-wider">
              Executive AI Appraisal
            </h3>
          </div>

          {loadingSummary ? (
            <div className="py-4">
              <LoadingIndicator message="Calibrating criteria summary and analyzing study guide..." />
            </div>
          ) : errorMsg ? (
            <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-300 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-[#7c6bff]/60 pl-4 py-1">
              "{overallFeedback}"
            </p>
          )}
        </motion.div>
      </div>

      {/* Accordion Questions Breakdown Section */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
            Itemised Breakdown
          </h2>
        </div>

        {questions.map((q, idx) => {
          const isExpanded = expandedIndex === idx;
          const score = q.score || 0;
          let ratingColor = 'text-gray-400';
          if (score >= 8) ratingColor = 'text-emerald-400';
          else if (score >= 5) ratingColor = 'text-amber-400';
          else if (score > 0) ratingColor = 'text-rose-400';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-[#13131a] rounded-xl border border-gray-800/80 overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                id={`accordion-summary-btn-${idx}`}
                onClick={() => toggleAccordion(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-800/20 cursor-pointer focus:outline-none transition-all"
              >
                <div className="flex items-center gap-4 flex-1 pr-4">
                  <div className="w-7 h-7 flex items-center justify-center rounded bg-gray-900 border border-gray-800 text-xs text-gray-400 shrink-0 font-bold">
                    {q.number}
                  </div>
                  <p className="font-semibold text-sm text-gray-200 line-clamp-1 flex-1">
                    {q.questionText}
                  </p>
                </div>

                <div className="flex items-center gap-4.5 shrink-0">
                  <div className="flex items-center gap-1 bg-gray-900/80 px-2 py-1 rounded border border-gray-800">
                    <Star className={`w-3.5 h-3.5 fill-current ${ratingColor}`} />
                    <span className={`text-xs font-bold ${ratingColor}`}>{score}</span>
                    <span className="text-[9px] text-gray-500 font-black">/10</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-gray-800/30 bg-[#0a0a0f]/40 space-y-4">
                  {/* Question Prompt */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Interviewer Prompt
                    </h4>
                    <p className="text-xs text-gray-200 font-medium">
                      {q.questionText}
                    </p>
                  </div>

                  {/* Submission */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Candidate Submission
                    </h4>
                    <p className="text-xs text-gray-400 bg-gray-950/60 p-3.5 rounded-lg border border-gray-900 leading-relaxed font-mono whitespace-pre-wrap">
                      {q.userAnswer || 'No answer submitted.'}
                    </p>
                  </div>

                  {/* Diagnostic Evaluation feedback */}
                  <div className="p-4 rounded-lg bg-[#7c6bff]/5 border border-[#7c6bff]/10 space-y-1.5">
                    <div className="flex items-center gap-1 text-[#7c6bff]">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Diagnostic Evaluation
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic">
                      "{q.feedback}"
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Button controls */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onRestart}
          id="restart-interview-btn"
          className="px-6 py-3 rounded-xl text-[#0a0a0f] font-bold tracking-wide uppercase bg-gradient-to-r from-white to-gray-200 hover:brightness-105 shadow-xl flex items-center gap-2 cursor-pointer transition-all text-xs"
        >
          <RefreshCw className="w-4 h-4" /> Start New Interview
        </button>
      </div>

      {/* Humble Footer */}
      <div className="mt-12 text-center text-[10px] text-gray-600">
        AI-generated evaluation scorecards are recommendations to guide user studies.
      </div>
    </div>
  );
}
