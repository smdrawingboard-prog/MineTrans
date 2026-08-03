import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Student {
  id: number;
  email: string;
  name: string;
  enrolledAt: Date;
  completedAt: Date | null;
  status: "active" | "completed" | "suspended";
}

interface Course {
  id: number;
  title: string;
  description: string;
  totalSections: number;
  passingScore: number;
}

interface StudentProgress {
  studentId: number;
  courseId: number;
  completedSections: number;
  totalSections: number;
  averageScore: number;
  lastAccessedAt: string;
}

export default function StudentPortal() {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Map<number, StudentProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "certificates">("dashboard");

  const coursesQuery = trpc.certification.getCourses.useQuery();

  useEffect(() => {
    // Get student from localStorage
    const stored = localStorage.getItem("certStudent");
    if (!stored) {
      window.location.href = "/certification";
      return;
    }

    const studentData = JSON.parse(stored);
    setStudent(studentData);

    // Load courses
    if (coursesQuery.data) {
      setCourses(coursesQuery.data as Course[]);
    }

    setLoading(false);
  }, [coursesQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("certStudent");
    window.location.href = "/certification";
  };

  const handleStartCourse = (courseId: number) => {
    window.location.href = `/certification/course/${courseId}`;
  };

  const getProgressPercentage = (courseId: number): number => {
    const courseProgress = progress.get(courseId);
    if (!courseProgress) return 0;
    return Math.round((courseProgress.completedSections / courseProgress.totalSections) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading your dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-600/30 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-1">My Learning Dashboard</h1>
            <p className="text-slate-400">Welcome back, {student.name}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "dashboard"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "courses"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "certificates"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Certificates
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Courses Enrolled</p>
                  <p className="text-4xl font-bold text-amber-600">{courses.length}</p>
                </div>
              </Card>

              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Overall Progress</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {courses.length > 0
                      ? Math.round(
                          Array.from(progress.values()).reduce((sum, p) => sum + p.completedSections, 0) /
                            Array.from(progress.values()).reduce((sum, p) => sum + p.totalSections, 0) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </Card>

              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Member Since</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-amber-600/30 p-6">
              <h2 className="text-xl font-bold text-amber-600 mb-4">Your Learning Path</h2>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-slate-400">No courses available yet.</p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="bg-slate-700/50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{course.title}</h3>
                          <p className="text-sm text-slate-400">{course.totalSections} sections</p>
                        </div>
                        <span className="text-amber-600 font-semibold">{getProgressPercentage(course.id)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(course.id)} className="h-2" />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Courses</h2>

            {courses.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <p className="text-slate-400 mb-4">No courses available yet.</p>
                <Button
                  onClick={() => (window.location.href = "/certification")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Back to Certification
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-slate-800 border-amber-600/30 hover:border-amber-600/60 transition overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-amber-600 mb-2">{course.title}</h3>
                      <p className="text-slate-400 mb-4 text-sm">{course.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-400">Progress</span>
                          <span className="text-amber-600 font-semibold">{getProgressPercentage(course.id)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(course.id)} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                          Passing Score: {course.passingScore}%
                        </span>
                        <Button
                          onClick={() => handleStartCourse(course.id)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Certificates</h2>

            <Card className="bg-slate-800 border-amber-600/30 p-8 text-center">
              <div className="mb-4">
                <div className="text-5xl mb-4">📜</div>
                <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
                <p className="text-slate-400 mb-6">
                  Complete a course and pass the final exam to earn your certificate.
                </p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded text-left">
                <p className="text-sm text-slate-300 mb-3">
                  <strong>How to earn a certificate:</strong>
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>✓ Complete all course sections</li>
                  <li>✓ Pass all section quizzes</li>
                  <li>✓ Score {courses.length > 0 ? courses[0].passingScore : 70}% or higher on the final exam</li>
                  <li>✓ Download your digital certificate</li>
                </ul>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
