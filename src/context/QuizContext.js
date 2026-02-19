import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  CATEGORIES,
  QUESTION_BANKS,
  MOCK_TEST_WEIGHTS,
  MOCK_TEST_DURATION_SECONDS,
  MOCK_TEST_PASS_MARK,
  MOCK_TEST_QUESTION_COUNT,
} from "../data/questionBank";

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const auth = useAuth() || {};
  const userId = auth.user?.uid;

  // ─── Global State ────────────────────────────────────────
  const [mode, setMode] = useState(null); // null | "practice" | "mock"
  const [currentCategory, setCurrentCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [flagged, setFlagged] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);

  // Progress from Firestore
  const [userProgress, setUserProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Mock test timer
  const [timeRemaining, setTimeRemaining] = useState(MOCK_TEST_DURATION_SECONDS);
  const timerRef = useRef(null);

  // ─── Load User Progress ──────────────────────────────────
  const loadProgress = useCallback(async () => {
    if (!userId) return;
    setLoadingProgress(true);
    try {
      const docRef = doc(db, "user_progress", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserProgress(snap.data().progress || {});
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
    setLoadingProgress(false);
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // ─── Save Progress ───────────────────────────────────────
  const saveProgress = useCallback(async (categoryId, answeredId, wasCorrect) => {
    if (!userId) return;
    try {
      const docRef = doc(db, "user_progress", userId);
      const snap = await getDoc(docRef);
      const existing = snap.exists() ? (snap.data().progress || {}) : {};

      const catProgress = existing[categoryId] || { answered_ids: [], correct_ids: [] };
      if (!catProgress.answered_ids.includes(answeredId)) {
        catProgress.answered_ids.push(answeredId);
      }
      if (wasCorrect && !catProgress.correct_ids.includes(answeredId)) {
        catProgress.correct_ids.push(answeredId);
      } else if (!wasCorrect) {
        catProgress.correct_ids = catProgress.correct_ids.filter(id => id !== answeredId);
      }
      catProgress.last_attempt = Date.now();

      const newProgress = { ...existing, [categoryId]: catProgress };
      await setDoc(docRef, { progress: newProgress, subscription: "free" }, { merge: true });
      setUserProgress(newProgress);
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [userId]);

  // ─── Save Mock Test Result ───────────────────────────────
  const saveMockResult = useCallback(async (score, total, breakdown) => {
    if (!userId) return;
    try {
      const docRef = doc(db, "user_progress", userId);
      const snap = await getDoc(docRef);
      const existing = snap.exists() ? snap.data() : {};
      const mockTests = existing.mock_tests || [];
      mockTests.push({ score, total, breakdown, timestamp: Date.now() });
      await setDoc(docRef, { ...existing, mock_tests: mockTests }, { merge: true });
    } catch (e) {
      console.error("Failed to save mock result:", e);
    }
  }, [userId]);

  // ─── Practice Mode ───────────────────────────────────────
  const startPractice = useCallback((categoryId) => {
    const bank = QUESTION_BANKS[categoryId] || [];
    const catProgress = userProgress[categoryId] || { answered_ids: [], correct_ids: [] };

    // Priority queue: unanswered > incorrect > correct
    const unanswered = bank.filter(q => !catProgress.answered_ids.includes(q.id));
    const incorrect = bank.filter(q =>
      catProgress.answered_ids.includes(q.id) && !catProgress.correct_ids.includes(q.id)
    );
    const correct = bank.filter(q => catProgress.correct_ids.includes(q.id));

    const ordered = [...unanswered, ...incorrect, ...correct];

    setMode("practice");
    setCurrentCategory(categoryId);
    setQuestions(ordered.length > 0 ? ordered : bank);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers({});
    setFlagged(new Set());
    setIsFinished(false);
    setResults(null);
  }, [userProgress]);

  // ─── Mock Test Mode ──────────────────────────────────────
  const startMockTest = useCallback(() => {
    const selected = [];

    Object.entries(MOCK_TEST_WEIGHTS).forEach(([catId, count]) => {
      const bank = QUESTION_BANKS[catId] || [];
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, count).map(q => ({ ...q, _category: catId })));
    });

    // If we're short of 50, fill from the biggest banks
    while (selected.length < MOCK_TEST_QUESTION_COUNT) {
      const allQuestions = Object.entries(QUESTION_BANKS).flatMap(([catId, qs]) =>
        qs.map(q => ({ ...q, _category: catId }))
      );
      const unused = allQuestions.filter(q => !selected.find(s => s.id === q.id));
      if (unused.length === 0) break;
      const pick = unused[Math.floor(Math.random() * unused.length)];
      selected.push(pick);
    }

    // Shuffle final set
    const shuffled = selected.sort(() => Math.random() - 0.5).slice(0, MOCK_TEST_QUESTION_COUNT);

    setMode("mock");
    setCurrentCategory(null);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers({});
    setFlagged(new Set());
    setIsFinished(false);
    setResults(null);
    setTimeRemaining(MOCK_TEST_DURATION_SECONDS);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-finish mock test when timer hits 0
  useEffect(() => {
    if (mode === "mock" && timeRemaining === 0 && !isFinished) {
      finishMockTest();
    }
  }, [timeRemaining, mode, isFinished]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Answer Handling ─────────────────────────────────────
  const selectAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null && mode === "practice") return;
    if (isFinished) return;

    const question = questions[currentIndex];
    setSelectedAnswer(answerIndex);

    if (mode === "practice") {
      setShowFeedback(true);
      const wasCorrect = answerIndex === question.correct_index;
      const categoryId = currentCategory;
      saveProgress(categoryId, question.id, wasCorrect);
    } else {
      // Mock: just record answer, no feedback
      setAnswers(prev => ({ ...prev, [question.id]: answerIndex }));
    }
  }, [selectedAnswer, mode, currentIndex, questions, currentCategory, isFinished, saveProgress]);

  // ─── Navigation ──────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (mode === "practice") {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Practice complete
        setIsFinished(true);
      }
    } else {
      // Mock: just move forward
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        const nextQ = questions[currentIndex + 1];
        setSelectedAnswer(answers[nextQ?.id] ?? null);
        setShowFeedback(false);
      }
    }
  }, [mode, currentIndex, questions, answers]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQ = questions[currentIndex - 1];
      if (mode === "mock") {
        setSelectedAnswer(answers[prevQ?.id] ?? null);
      } else {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }
  }, [currentIndex, questions, mode, answers]);

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      const q = questions[index];
      if (mode === "mock") {
        setSelectedAnswer(answers[q?.id] ?? null);
      } else {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }
  }, [questions, mode, answers]);

  // ─── Flagging ────────────────────────────────────────────
  const toggleFlag = useCallback(() => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }, [questions, currentIndex]);

  // ─── Finish Mock Test ────────────────────────────────────
  const finishMockTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);

    let correct = 0;
    const breakdown = {};

    questions.forEach(q => {
      const cat = q._category || "unknown";
      if (!breakdown[cat]) breakdown[cat] = { correct: 0, total: 0 };
      breakdown[cat].total += 1;

      if (answers[q.id] === q.correct_index) {
        correct += 1;
        breakdown[cat].correct += 1;
      }
    });

    const res = {
      score: correct,
      total: questions.length,
      passed: correct >= MOCK_TEST_PASS_MARK,
      breakdown,
      timeUsed: MOCK_TEST_DURATION_SECONDS - timeRemaining,
    };
    setResults(res);
    saveMockResult(correct, questions.length, breakdown);
  }, [questions, answers, timeRemaining, saveMockResult]);

  // ─── Reset / Exit ────────────────────────────────────────
  const exitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(null);
    setCurrentCategory(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers({});
    setFlagged(new Set());
    setIsFinished(false);
    setResults(null);
    setTimeRemaining(MOCK_TEST_DURATION_SECONDS);
  }, []);

  // ─── Category Progress Getters ───────────────────────────
  const getCategoryProgress = useCallback((categoryId) => {
    const bank = QUESTION_BANKS[categoryId] || [];
    const catProgress = userProgress[categoryId] || { answered_ids: [], correct_ids: [] };
    const totalQuestions = bank.length;
    const answered = catProgress.answered_ids.length;
    const correct = catProgress.correct_ids.length;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    let status = "not_started";
    if (correct === totalQuestions && totalQuestions > 0) status = "completed";
    else if (answered > 0) status = "in_progress";

    return { totalQuestions, answered, correct, percentage, status };
  }, [userProgress]);

  const getReadinessScore = useCallback(() => {
    // Readiness = (Average Mock Score * 0.6) + (Total Syllabus Completion % * 0.4)
    const mockTests = []; // We'd need to load these from Firestore
    const avgMock = mockTests.length > 0
      ? (mockTests.reduce((sum, t) => sum + (t.score / t.total) * 100, 0) / mockTests.length)
      : 0;

    let totalCorrect = 0;
    let totalQuestions = 0;
    CATEGORIES.forEach(cat => {
      const bank = QUESTION_BANKS[cat.id] || [];
      const prog = userProgress[cat.id] || { correct_ids: [] };
      totalCorrect += prog.correct_ids?.length || 0;
      totalQuestions += bank.length;
    });
    const syllabusPercent = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return Math.round(avgMock * 0.6 + syllabusPercent * 0.4);
  }, [userProgress]);

  const value = {
    // State
    mode, currentCategory, questions, currentIndex,
    selectedAnswer, showFeedback, answers, flagged,
    isFinished, results, timeRemaining, userProgress,
    loadingProgress,
    // Constants
    CATEGORIES, MOCK_TEST_PASS_MARK, MOCK_TEST_QUESTION_COUNT,
    // Actions
    startPractice, startMockTest, selectAnswer,
    nextQuestion, prevQuestion, goToQuestion,
    toggleFlag, finishMockTest, exitQuiz,
    loadProgress,
    // Getters
    getCategoryProgress, getReadinessScore,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside QuizProvider");
  return ctx;
}
