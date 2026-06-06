/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoleId, QuestionData, ROLES } from '../types';
import LoadingIndicator from './LoadingIndicator';
import { AlertCircle, ArrowRight, CheckCircle, MessageSquare, Send, Award, Sparkles, Volume2 } from 'lucide-react';

interface InterviewFlowProps {
  roleId: RoleId;
  onInterviewComplete: (questions: QuestionData[]) => void;
  onExit: () => void;
}

export default function InterviewFlow({ roleId, onInterviewComplete, onExit }: InterviewFlowProps) {
  const currentRole = ROLES.find((r) => r.id === roleId);
  const roleName = currentRole ? currentRole.title : 'Technical Candidate';

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentQuestionData, setCurrentQuestionData] = useState<QuestionData | null>(null);

  // Generate question helper
  const getNextQuestion = async (index: number, existingQuestions: QuestionData[]) => {
    setLoadingQuestion(true);
    setErrorMsg(null);
    setCurrentAnswer('');

    const questionNumber = index + 1;
    const previousTexts = existingQuestions.map((q) => `"${q.questionText}"`).join(', ') || 'None';

    const prompt = `You are an expert technical interviewer. Generate interview question #${questionNumber} of 5 for a ${roleName} position. Previous questions: ${previousTexts}. Make each question different and progressively more challenging. Return ONLY the question text, nothing else.`;

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
          throw new Error(`Failed to fetch question (HTTP ${response.status})`);
        }
        throw jsonErr;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Failed to fetch question (HTTP ${response.status})`);
      }

      const rawQuestion = data.text || '';
      const cleanQuestionText = rawQuestion.replace(/^["'\s]+|["'\s]+$/g, '').trim();

      const newQ: QuestionData = {
        number: questionNumber,
        questionText: cleanQuestionText || `Describe standard practices for a senior ${roleName} when implementing system scalability.`,
      };

      setCurrentQuestionData(newQ);
    } catch (err: any) {
      console.error('Error generating question:', err);
      setErrorMsg(err.message || 'Unable to connect to the interview engine. Please retry.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Generate the first question on mount
  useEffect(() => {
    getNextQuestion(0, []);
  }, [roleId]);

  // Handle evaluation submission
  const handleSubmitAnswer = async () => {
    if (!currentQuestionData || !currentAnswer.trim() || evaluating) return;

    setEvaluating(true);
    setErrorMsg(null);

    const questionText = currentQuestionData.questionText;
    const answer = currentAnswer.trim();

    const prompt = `You are an expert ${roleName} interviewer. Evaluate this answer.
Question: ${questionText}
Candidate answer: ${answer}
Reply in EXACTLY this format:
SCORE: [0-10]
FEEDBACK: [2-3 sentences: what was good, what to improve, one specific tip]`;

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
          throw new Error(`Failed to evaluate answer (HTTP ${response.status})`);
        }
        throw jsonErr;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Failed to evaluate answer (HTTP ${response.status})`);
      }

      const apiText = data.text || '';
      
      // Parse response cleanly
      let parsedScore = 7; // safe default
      let parsedFeedback = 'Your answer covers general concepts but lacks specific architectural details. Focus on describing clear design trade-offs.';

      const scoreRegex = /SCORE:\s*(\d+)/i;
      const feedbackRegex = /FEEDBACK:\s*([\s\S]+)/i;

      const scoreMatch = apiText.match(scoreRegex);
      if (scoreMatch && scoreMatch[1]) {
        const val = parseInt(scoreMatch[1], 10);
        if (!isNaN(val) && val >= 0 && val <= 10) {
          parsedScore = val;
        }
      }

      const feedbackMatch = apiText.match(feedbackRegex);
      if (feedbackMatch && feedbackMatch[1]) {
        parsedFeedback = feedbackMatch[1].trim();
      } else {
        // Fallback strategy if keyword FEEDBACK: is missing but the evaluation was returned
        const strippedScoreText = apiText.replace(/SCORE:\s*\d+/gi, '').trim();
        if (strippedScoreText.length > 25) {
          parsedFeedback = strippedScoreText;
        }
      }

      const evaluatedQuestion: QuestionData = {
        ...currentQuestionData,
        userAnswer: answer,
        feedback: parsedFeedback,
        score: parsedScore,
      };

      setCurrentQuestionData(evaluatedQuestion);
      
      // Accumulate questions
      setQuestions((prev) => [...prev, evaluatedQuestion]);

    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      setErrorMsg(err.message || 'Unable to load evaluation feedback. Please submit again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= 5) {
      // Completed full session
      onInterviewComplete(questions);
    } else {
      setCurrentIndex(nextIdx);
      getNextQuestion(nextIdx, questions);
    }
  };

  // Score color helper
  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 5) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  const isCurrentSubmitted = currentQuestionData && currentQuestionData.feedback !== undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header and Quit Row */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/40">
        <div>
          <span className="text-xs text-[#7c6bff] uppercase font-bold tracking-wider">
            Mock Interview
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">{roleName}</h2>
        </div>
        <button
          onClick={onExit}
          className="text-xs text-gray-400 hover:text-rose-400 transition-colors border border-gray-800 px-3 py-1.5 rounded-lg bg-[#13131a]/50"
        >
          Quit Session
        </button>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-gray-400 font-medium">Question {currentIndex + 1} of 5</span>
          <span className="text-[#7c6bff] font-semibold">{Math.round(((currentIndex) / 5) * 100)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#7c6bff]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Interview Engine Notice</p>
            <p className="mt-0.5 text-gray-300 text-xs">{errorMsg}</p>
          </div>
          <button
            onClick={() => {
              if (isCurrentSubmitted) {
                handleNext();
              } else if (currentAnswer) {
                handleSubmitAnswer();
              } else {
                getNextQuestion(currentIndex, questions);
              }
            }}
            className="text-xs underline text-rose-300 font-medium hover:text-rose-100 uppercase"
          >
            Retry Action
          </button>
        </div>
      )}

      {/* Master Animation Container */}
      <AnimatePresence mode="wait">
        {loadingQuestion ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#13131a] rounded-2xl border border-gray-800/80 p-8 min-h-[300px] flex items-center justify-center"
          >
            <LoadingIndicator message={`Formulating progressive scenario #${currentIndex + 1} tailored for ${roleName}...`} />
          </motion.div>
        ) : (
          currentQuestionData && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Question Banner */}
              <div className="p-6 md:p-8 rounded-2xl bg-[#13131a] border border-gray-800/80 shadow-xl shadow-black/30">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 items-center justify-center rounded-xl bg-[#7c6bff]/10 border border-[#7c6bff]/20 flex text-[#7c6bff] shrink-0">
                    <span className="text-sm font-black">{currentIndex + 1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      CHALLENGE SOURCE
                    </span>
                    <p className="text-lg md:text-xl font-bold text-gray-100 leading-snug">
                      {currentQuestionData.questionText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Coach Prep Guidelines Overlay Card */}
              <div className="bg-gradient-to-r from-[#13131a] to-[#12121e] rounded-xl border border-gray-800/60 p-4 flex gap-3 text-xs leading-relaxed text-gray-400 shadow-md">
                <Sparkles className="w-4 h-4 text-[#7c6bff] shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <span className="font-bold text-gray-200 block mb-0.5 uppercase tracking-wider text-[10px]">
                    Technical Coach Tip
                  </span>
                  For a high rating matching a <span className="text-[#9688ff] font-semibold">{roleName}</span> screening: detail design trade-offs, call out microservices or performance design frameworks, and reference modern tech stacks (e.g., Redis, Kafka, Postgres, or component models) to show domain fluency.
                </div>
              </div>

              {/* Answer Box / Evaluation Flow */}
              {!isCurrentSubmitted ? (
                <div className="bg-[#13131a] rounded-2xl border border-gray-800/80 p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="answer-area" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                      Your Technical Answer
                    </label>

                    <span className="text-[10px] text-gray-500 uppercase tracking-wider select-none">
                      Technical Board Input
                    </span>
                  </div>

                  <textarea
                    id="answer-area"
                    className="w-full h-40 bg-[#0a0a0f] border border-gray-800 focus:border-[#7c6bff]/60 focus:ring-1 focus:ring-[#7c6bff]/40 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none resize-none text-sm transition-all"
                    placeholder="Provide your solution, reasoning, or code snippet here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    disabled={evaluating}
                  />

                  {/* Dynamic Help Indicator Word Metric */}
                  <div className="flex items-center justify-between text-[11px] font-mono select-none px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Words:</span>
                      <span className={`font-bold ${currentAnswer.trim().split(/\s+/).filter(Boolean).length >= 30 ? 'text-emerald-400' : currentAnswer.trim().split(/\s+/).filter(Boolean).length >= 10 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).filter(Boolean).length : 0}
                      </span>
                    </div>

                    <div className="text-gray-500 text-right">
                      {currentAnswer.trim().split(/\s+/).filter(Boolean).length < 10 ? (
                        <span className="text-gray-500">💡 Tip: Write more details to expand your technical evaluation!</span>
                      ) : currentAnswer.trim().split(/\s+/).filter(Boolean).length < 30 ? (
                        <span className="text-[#7c6bff]/90 font-medium">✨ Keep going! Describe technical constraints.</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">🟢 Excellent detail coverage targets.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSubmitAnswer}
                      id="submit-answer-btn"
                      disabled={!currentAnswer.trim() || currentAnswer.trim().length < 5 || evaluating}
                      className="px-5 py-2.5 rounded-xl text-white font-medium bg-[#7c6bff] hover:bg-[#6c59ff] disabled:opacity-40 disabled:hover:bg-[#7c6bff] flex items-center gap-2 cursor-pointer transition-all text-sm h-11 shadow-lg shadow-[#7c6bff]/15"
                    >
                      {evaluating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Evaluating Solution...
                        </>
                      ) : (
                        <>
                          Submit Solution <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Feedback Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Performance Analysis Box */}
                  <div className="bg-[#13131a] rounded-2xl border border-gray-800/80 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-2xl border bg-gray-900/60 p-4 border-gray-800 self-center md:self-start">
                      <Award className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-2xl font-black text-white">{currentQuestionData.score}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 text-center">
                        of 10
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#7c6bff]" />
                        <span className="text-xs font-bold text-[#7c6bff] uppercase tracking-wider">
                          Interviewer Feedback
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed italic bg-gray-950/40 p-4 rounded-xl border border-gray-950">
                        "{currentQuestionData.feedback}"
                      </p>
                    </div>
                  </div>

                  {/* Submission summary and navigation */}
                  <div className="flex justify-between items-center bg-[#13131a] border border-gray-800/80 p-4 rounded-xl">
                    <span className="text-xs text-gray-500">
                      Answer saved. Setup ready for next stage.
                    </span>
                    <button
                      onClick={handleNext}
                      id="next-question-btn"
                      className="px-5 py-2 rounded-lg text-white font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-[#7c6bff] to-[#6351f0] hover:brightness-105 transition-all flex items-center gap-1.5"
                    >
                      {currentIndex === 4 ? 'Generate Final Report' : 'Next Question'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
