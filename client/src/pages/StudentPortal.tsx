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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-background/90 backdrop-blur-md border-b border-border p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-primary mb-1">My Learning Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {student.name}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded font-label text-xs tracking-[0.05em] uppercase transition ${
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground shadow-card-rest"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded font-label text-xs tracking-[0.05em] uppercase transition ${
              activeTab === "courses"
                ? "bg-primary text-primary-foreground shadow-card-rest"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-4 py-2 rounded font-label text-xs tracking-[0.05em] uppercase transition ${
              activeTab === "certificates"
                ? "bg-primary text-primary-foreground shadow-card-rest"
                : "text-muted-foreground hover:text-foreground"
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
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Courses Enrolled</p>
                  <p className="text-4xl text-primary">{courses.length}</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Overall Progress</p>
                  <p className="text-4xl text-primary">
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

              <Card className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Member Since</p>
                  <p className="text-lg font-medium text-primary">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl text-primary mb-4">Your Learning Path</h2>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p className="text-muted-foreground">No courses available yet.</p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="bg-muted/50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.totalSections} sections</p>
                        </div>
                        <span className="text-primary font-medium">{getProgressPercentage(course.id)}%</span>
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
            <h2 className="text-2xl">My Courses</h2>

            {courses.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No courses available yet.</p>
                <Button onClick={() => (window.location.href = "/certification")}>
                  Back to Certification
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:border-primary hover:shadow-card-hover hover:-translate-y-1 transition overflow-hidden"
                  >
                    <div className="p-6">
                      <h3 className="text-xl text-primary mb-2">{course.title}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">{course.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-primary font-medium">{getProgressPercentage(course.id)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(course.id)} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Passing Score: {course.passingScore}%
                        </span>
                        <Button onClick={() => handleStartCourse(course.id)}>
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
            <h2 className="text-2xl">My Certificates</h2>

            <Card className="p-8 text-center">
              <div className="mb-4">
                <h3 className="text-xl text-foreground mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Complete a course and pass the final exam to earn your certificate.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded text-left">
                <p className="text-sm text-secondary-foreground mb-3">
                  <strong>How to earn a certificate:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside marker:text-primary">
                  <li>Complete all course sections</li>
                  <li>Pass all section quizzes</li>
                  <li>Score {courses.length > 0 ? courses[0].passingScore : 70}% or higher on the final exam</li>
                  <li>Download your digital certificate</li>
                </ul>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
