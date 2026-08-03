import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import CriticalFailureAnimation from "@/components/CriticalFailureAnimation";

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: string[] | null;
  correctAnswer: string;
  points: number;
  explanation: string;
}

interface ExamState {
  started: boolean;
  timeRemaining: number;
  currentQuestion: number;
  answers: Record<string, string>;
  submitted: boolean;
  results: {
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    feedback: Record<string, { correct: boolean; explanation: string }>;
  } | null;
}

export default function FinalExam() {
  const [, params] = useRoute("/certification/exam/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const [exam, setExam] = useState<ExamState>({
    started: false,
    timeRemaining: 0,
    currentQuestion: 0,
    answers: {},
    submitted: false,
    results: null,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [failureAnimationDone, setFailureAnimationDone] = useState(false);

  const getFinalExamQuery = trpc.certification.getFinalExam.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  const getQuizQuestionsQuery = trpc.certification.getQuizQuestions.useQuery(
    { quizId: getFinalExamQuery.data?.id || 0 },
    { enabled: !!getFinalExamQuery.data?.id }
  );

  const submitExamMutation = trpc.certification.submitQuiz.useMutation();

  useEffect(() => {
    const stored = localStorage.getItem("certStudent");
    if (!stored) {
      window.location.href = "/certification";
      return;
    }
    setStudent(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (getQuizQuestionsQuery.data) {
      setQuestions(getQuizQuestionsQuery.data as Question[]);
      setLoading(false);
    }
  }, [getQuizQuestionsQuery.data]);

  // Timer effect
  useEffect(() => {
    if (!exam.started || exam.submitted) return;

    const timer = setInterval(() => {
      setExam((prev) => {
        if (prev.timeRemaining <= 1) {
          handleSubmitExam();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam.started, exam.submitted]);

  const startExam = () => {
    const timeLimit = getFinalExamQuery.data?.timeLimit || 120; // 2 hours in minutes
    setExam((prev) => ({
      ...prev,
      started: true,
      timeRemaining: timeLimit * 60, // Convert to seconds
    }));
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setExam((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
  };

  const goToNextQuestion = () => {
    if (exam.currentQuestion < questions.length - 1) {
      setExam((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  const goToPreviousQuestion = () => {
    if (exam.currentQuestion > 0) {
      setExam((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleSubmitExam = async () => {
    if (!student) return;

    try {
      const result = await submitExamMutation.mutateAsync({
        studentId: student.id,
        quizId: getFinalExamQuery.data?.id || 0,
        answers: exam.answers,
        timeSpent: (getFinalExamQuery.data?.timeLimit || 120) * 60 - exam.timeRemaining,
      });

      setExam((prev) => ({
        ...prev,
        submitted: true,
        results: result,
      }));

      if (result.passed) {
        toast.success("Congratulations! You passed the exam!");
      } else {
        toast.error(`You scored ${result.percentage}%. Passing score is 70%.`);
      }
    } catch (error) {
      toast.error("Failed to submit exam");
      console.error(error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading final exam...</p>
      </div>
    );
  }

  if (!getFinalExamQuery.data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-amber-600/30 p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Exam Not Found</h2>
          <p className="text-slate-400 mb-6">The final exam for this course is not available.</p>
          <Button
            onClick={() => (window.location.href = "/certification/dashboard")}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!exam.started) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-amber-600/30 p-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-amber-600 mb-4">Final Exam</h1>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-slate-400 mb-2">
                <strong>Total Questions:</strong> {questions.length}
              </p>
              <p className="text-slate-400 mb-2">
                <strong>Time Limit:</strong> {getFinalExamQuery.data?.timeLimit || 120} minutes
              </p>
              <p className="text-slate-400 mb-2">
                <strong>Passing Score:</strong> {getFinalExamQuery.data?.passingScore || 70}%
              </p>
            </div>

            <div className="bg-slate-700/50 p-4 rounded">
              <p className="text-amber-600 font-semibold mb-2">Important:</p>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>✓ You can review and change your answers before submitting</li>
                <li>✓ The timer will count down - manage your time wisely</li>
                <li>✓ You cannot retake the exam after submission</li>
                <li>✓ You must score {getFinalExamQuery.data?.passingScore || 70}% or higher to pass</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={startExam}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg"
          >
            Start Exam
          </Button>
        </Card>
      </div>
    );
  }

  if (exam.submitted && exam.results && !exam.results.passed && !failureAnimationDone) {
    return (
      <CriticalFailureAnimation onComplete={() => setFailureAnimationDone(true)} />
    );
  }

  if (exam.submitted && exam.results) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800 border-amber-600/30 p-8 text-center mb-6">
            <div className="mb-6">
              <div className="text-6xl mb-4">{exam.results.passed ? "✓" : "✗"}</div>
              <h1 className={`text-4xl font-bold mb-2 ${exam.results.passed ? "text-green-500" : "text-red-500"}`}>
                {exam.results.passed ? "Exam Passed!" : "Exam Not Passed"}
              </h1>
              <p className="text-2xl font-semibold text-amber-600">
                {exam.results.percentage}%
              </p>
            </div>

            <div className="bg-slate-700/50 p-6 rounded mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Your Score</p>
                  <p className="text-2xl font-bold text-white">{exam.results.score} points</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-white">{exam.results.totalPoints}</p>
                </div>
              </div>
            </div>

            {exam.results.passed && (
              <div className="bg-green-900/20 border border-green-600/50 p-4 rounded mb-6">
                <p className="text-green-400 font-semibold">
                  Congratulations! Your certificate is ready for download.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => (window.location.href = "/certification/dashboard")}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Back to Dashboard
              </Button>
              {exam.results.passed && (
                <Button
                  onClick={() => (window.location.href = `/certification/certificate/${courseId}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Download Certificate
                </Button>
              )}
            </div>
          </Card>

          {/* Detailed Results */}
          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <h2 className="text-2xl font-bold text-amber-600 mb-4">Detailed Results</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => {
                const feedback = exam.results?.feedback[q.id.toString()];
                const isCorrect = feedback?.correct;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded border ${
                      isCorrect
                        ? "bg-green-900/20 border-green-600/50"
                        : "bg-red-900/20 border-red-600/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                        {isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-1">
                          Question {idx + 1}: {q.questionText}
                        </p>
                        <p className="text-sm text-slate-400 mb-2">
                          Your answer: {exam.answers[q.id] || "Not answered"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-slate-300">
                            Correct answer: {q.correctAnswer}
                          </p>
                        )}
                        {feedback?.explanation && (
                          <p className="text-sm text-slate-300 mt-2 italic">
                            {feedback.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[exam.currentQuestion];
  const answeredCount = Object.keys(exam.answers).length;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 border-b border-amber-600/30 p-4 mb-6 rounded flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-600">Final Exam</h1>
            <p className="text-slate-400 text-sm">
              Question {exam.currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Time Remaining</p>
            <p className={`text-3xl font-bold ${exam.timeRemaining < 300 ? "text-red-500" : "text-amber-600"}`}>
              {formatTime(exam.timeRemaining)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400 text-sm">Progress</span>
            <span className="text-amber-600 text-sm">
              {answeredCount} of {questions.length} answered
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card className="bg-slate-800 border-amber-600/30 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">{currentQuestion.questionText}</h2>

            {currentQuestion.questionType === "multiple-choice" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center p-4 border border-slate-600 rounded cursor-pointer hover:bg-slate-700/50 transition"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={exam.answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.questionType === "short-answer" && (
              <input
                type="text"
                value={exam.answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-amber-600"
              />
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={goToPreviousQuestion}
            disabled={exam.currentQuestion === 0}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            ← Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setExam((prev) => ({ ...prev, currentQuestion: idx }))}
                className={`w-10 h-10 rounded font-semibold transition ${
                  idx === exam.currentQuestion
                    ? "bg-amber-600 text-white"
                    : exam.answers[questions[idx].id]
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {exam.currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
