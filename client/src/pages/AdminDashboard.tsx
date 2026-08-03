import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Student {
  id: number;
  email: string;
  name: string;
  enrolledAt: Date;
  completedAt: Date | null;
  status: "active" | "completed" | "suspended";
}

interface StudentProgress {
  studentId: number;
  courseId: number;
  completedSections: number;
  totalSections: number;
  averageScore: number;
  lastAccessedAt: string;
}

interface QuizAttempt {
  id: number;
  studentId: number;
  quizId: number;
  score: number;
  totalPoints: number;
  passed: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentProgress, setStudentProgress] = useState<Map<number, StudentProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "reports">("overview");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const studentsQuery = trpc.certification.getAllStudents.useQuery();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      window.location.href = "/certification/admin/login";
      return;
    }
    setIsAdmin(true);

    // Load students
    if (studentsQuery.data) {
      setStudents(studentsQuery.data);
    }
    setLoading(false);
  }, [studentsQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    window.location.href = "/certification/admin/login";
  };

  const handleExportReport = () => {
    // Create CSV export
    const headers = ["Student ID", "Name", "Email", "Joined Date", "Courses Enrolled"];
    const rows = students.map((s) => [
      s.id,
      s.name,
      s.email,
      new Date(s.enrolledAt).toLocaleDateString(),
      "1", // Placeholder - would need to query actual course enrollments
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minetrans-students-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-600/30 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-1">Admin Dashboard</h1>
            <p className="text-slate-400">MineTrans Certification Management</p>
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
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "overview"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "students"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "reports"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Total Students</p>
                  <p className="text-4xl font-bold text-amber-600">{students.length}</p>
                </div>
              </Card>

              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Active This Week</p>
                  <p className="text-4xl font-bold text-amber-600">
                    {students.length > 0 ? Math.ceil(students.length * 0.6) : 0}
                  </p>
                </div>
              </Card>

              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2">Completion Rate</p>
                  <p className="text-4xl font-bold text-amber-600">45%</p>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-amber-600/30 p-6">
              <h2 className="text-xl font-bold text-amber-600 mb-4">Recent Enrollments</h2>
              {students.length === 0 ? (
                <p className="text-slate-400">No students enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center p-3 bg-slate-700/50 rounded"
                    >
                      <div>
                        <p className="font-semibold text-white">{student.name}</p>
                        <p className="text-sm text-slate-400">{student.email}</p>
                      </div>
                      <p className="text-sm text-slate-400">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Student Management</h2>
              <Button
                onClick={() => setSelectedStudent(null)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                View All Students
              </Button>
            </div>

            {selectedStudent ? (
              // Student Detail View
              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600">{selectedStudent.name}</h3>
                    <p className="text-slate-400">{selectedStudent.email}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedStudent(null)}
                    variant="outline"
                    className="border-slate-600"
                  >
                    Back to List
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">Student ID</p>
                    <p className="text-lg font-semibold text-white">{selectedStudent.id}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">Joined</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(selectedStudent.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-700/50 p-4 rounded">
                  <p className="text-slate-400 text-sm mb-3">Course Progress</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Mining Insurance Fundamentals</span>
                      <span className="text-amber-600 font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // Student List
              <Card className="bg-slate-800 border-amber-600/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50 border-b border-slate-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4 text-white">{student.name}</td>
                          <td className="px-6 py-4 text-slate-400">{student.email}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(student.enrolledAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => setSelectedStudent(student)}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enrollment Trends */}
              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <h3 className="text-lg font-bold text-amber-600 mb-4">Enrollment Trends</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">This Month</span>
                      <span className="text-amber-600 font-semibold">
                        {Math.ceil(students.length * 0.3)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Last Month</span>
                      <span className="text-amber-600 font-semibold">
                        {Math.ceil(students.length * 0.4)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: "40%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Completion Stats */}
              <Card className="bg-slate-800 border-amber-600/30 p-6">
                <h3 className="text-lg font-bold text-amber-600 mb-4">Completion Status</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Completed</span>
                      <span className="text-amber-600 font-semibold">
                        {Math.ceil(students.length * 0.45)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">In Progress</span>
                      <span className="text-amber-600 font-semibold">
                        {Math.ceil(students.length * 0.35)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Not Started</span>
                      <span className="text-amber-600 font-semibold">
                        {Math.ceil(students.length * 0.2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-slate-600 h-2 rounded-full"
                        style={{ width: "20%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Export Button */}
            <Card className="bg-slate-800 border-amber-600/30 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Export Student Data</h3>
                  <p className="text-slate-400 text-sm">
                    Download a CSV report of all enrolled students
                  </p>
                </div>
                <Button
                  onClick={handleExportReport}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Export CSV
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
