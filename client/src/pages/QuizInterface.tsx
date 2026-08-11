import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import CriticalFailureAnimation from "@/components/CriticalFailureAnimation";

interface Student {
  id: number;
  email: string;
  name: string;
}

interface AnswerFeedback {
  questionId: number;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

export default function QuizInterface() {
  const [, params] = useRoute("/certification/quiz/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const [student, setStudent] = useState<Student | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitionDirection, setTransitionDirection] = useState<
    "forward" | "backward"
  >("forward");
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [failureAnimationDone, setFailureAnimationDone] = useState(false);

  const quizQuery = trpc.certification.getFinalExam.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );
  const questionsQuery = trpc.certification.getQuizQuestions.useQuery(
    { quizId: 0 },
    { enabled: false }
  );
  const submitMutation = trpc.certification.submitQuiz.useMutation();

  useEffect(() => {
    const stored = localStorage.getItem("certStudent");
    if (!stored) {
      window.location.href = "/certification";
      return;
    }
    setStudent(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (quizQuery.data) {
      setQuiz(quizQuery.data);
      questionsQuery.refetch();
    }
  }, [quizQuery.data]);

  useEffect(() => {
    if (questionsQuery.data && questionsQuery.data.length > 0) {
      setQuestions(questionsQuery.data);
      setLoading(false);
    }
  }, [questionsQuery.data]);

  const handleAnswerChange = (questionId: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setAnswers({
      ...answers,
      [questionId]: value,
    });

    // Show immediate feedback
    const isCorrect = value === question.correctAnswer;
    setAnswerFeedback({
      questionId,
      isCorrect,
      selectedAnswer: value,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
    setShowFeedback(true);

    // Auto-hide feedback after 2 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const handleNextQuestion = () => {
    setTransitionDirection("forward");
    setShowFeedback(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePreviousQuestion = () => {
    setTransitionDirection("backward");
    setShowFeedback(false);
    setCurrentQuestion(Math.max(0, currentQuestion - 1));
  };

  const handleSubmitQuiz = async () => {
    if (!student || !quiz) return;

    try {
      const result = await submitMutation.mutateAsync({
        studentId: student.id,
        quizId: quiz.id,
        answers,
      });

      setResult(result);
      setSubmitted(true);
      toast.success(result.passed ? "Quiz passed!" : "Quiz completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
    }
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-slate-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (submitted && result && !result.passed && !failureAnimationDone) {
    return (
      <CriticalFailureAnimation
        onComplete={() => setFailureAnimationDone(true)}
      />
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <Card className="bg-slate-800 border-amber-600/30 p-8 text-center">
            <div className="mb-6">
              <div
                className={`text-6xl font-bold mb-4 ${result.passed ? "text-green-500" : "text-red-500"}`}
              >
                {result.passed ? "✓" : "✗"}
              </div>
              <h1 className="text-3xl font-bold text-amber-600 mb-2">
                {result.passed ? "Quiz Passed!" : "Quiz Complete"}
              </h1>
            </div>

            <div className="mb-6">
              <div className="text-5xl font-bold text-amber-600 mb-2">
                {result.percentage}%
              </div>
              <p className="text-slate-300">
                You scored {result.score} out of {result.totalPoints} points
              </p>
            </div>

            <div
              className={`p-4 rounded mb-6 ${
                result.passed
                  ? "bg-green-900/30 border border-green-600"
                  : "bg-red-900/30 border border-red-600"
              }`}
            >
              <p className="text-lg font-medium">
                {result.passed
                  ? "Congratulations! You've passed this quiz."
                  : "Please review the material and try again."}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() =>
                  (window.location.href = "/certification/dashboard")
                }
                variant="outline"
                className="border-amber-600 text-amber-600"
              >
                Back to Dashboard
              </Button>
              {!result.passed && (
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setAnswerFeedback(null);
                    setFailureAnimationDone(false);
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Retake Quiz
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = answers[question?.id] !== undefined;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-amber-600">{quiz.title}</h2>
            <span className="text-slate-400 text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card with Animation */}
        {question && (
          <div
            className={`transition-all duration-500 ease-out transform ${
              transitionDirection === "forward"
                ? "animate-slideInRight"
                : "animate-slideInLeft"
            }`}
          >
            <Card className="bg-slate-800 border-amber-600/30 p-8 mb-6">
              {/* Question Text */}
              <h3 className="text-xl font-bold text-white mb-8 leading-relaxed">
                {question.questionText}
              </h3>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {question.questionType === "multiple_choice" &&
                question.options ? (
                  question.options.map((option: string, idx: number) => {
                    const isSelected = answers[question.id] === option;
                    const isCorrectOption = option === question.correctAnswer;
                    const showCorrect = showFeedback && isCorrectOption;
                    const showIncorrect =
                      showFeedback && isSelected && !isCorrectOption;

                    return (
                      <label
                        key={idx}
                        className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                          showCorrect
                            ? "border-green-500 bg-green-900/20 scale-105"
                            : showIncorrect
                              ? "border-red-500 bg-red-900/20 scale-105"
                              : isSelected
                                ? "border-amber-600 bg-amber-600/10"
                                : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={e =>
                            handleAnswerChange(question.id, e.target.value)
                          }
                          className="mr-3 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-slate-300 flex-1">{option}</span>
                        {showCorrect && (
                          <span className="text-green-400 font-bold ml-2 animate-pulse">
                            ✓
                          </span>
                        )}
                        {showIncorrect && (
                          <span className="text-red-400 font-bold ml-2 animate-pulse">
                            ✗
                          </span>
                        )}
                      </label>
                    );
                  })
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answers[question.id] || ""}
                      onChange={e =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      placeholder="Enter your answer"
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded text-white placeholder:text-slate-500 focus:border-amber-600 focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Feedback Message */}
              {showFeedback && answerFeedback && (
                <div
                  className={`mb-6 p-4 rounded-lg border-l-4 animate-slideDown ${
                    answerFeedback.isCorrect
                      ? "bg-green-900/30 border-l-green-500 text-green-300"
                      : "bg-red-900/30 border-l-red-500 text-red-300"
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {answerFeedback.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </p>
                  {!answerFeedback.isCorrect && (
                    <p className="text-sm opacity-90">
                      Correct answer:{" "}
                      <span className="font-semibold">
                        {answerFeedback.correctAnswer}
                      </span>
                    </p>
                  )}
                  {answerFeedback.explanation && (
                    <p className="text-sm mt-2 opacity-90">
                      {answerFeedback.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Question Status Indicator */}
              <div className="mb-6 flex gap-2 flex-wrap">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTransitionDirection(
                        idx > currentQuestion ? "forward" : "backward"
                      );
                      setCurrentQuestion(idx);
                      setShowFeedback(false);
                    }}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                      idx === currentQuestion
                        ? "bg-amber-600 text-white ring-2 ring-amber-400"
                        : answers[questions[idx].id] !== undefined
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4 pt-6 border-t border-slate-700">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="border-amber-600 text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!isAnswered}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!isAnswered}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
