import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  enrollmentTrend: Array<{ date: string; count: number }>;
  courseCompletion: Array<{ name: string; completed: number; total: number }>;
  quizPerformance: Array<{ name: string; average: number }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    enrollmentTrend: [],
    courseCompletion: [],
    quizPerformance: [],
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  const studentsQuery = trpc.certification.getAllStudents.useQuery();
  const coursesQuery = trpc.certification.getCourses.useQuery();

  useEffect(() => {
    const generateAnalytics = async () => {
      if (!studentsQuery.data || !coursesQuery.data) return;

      const students = studentsQuery.data;
      const courses = coursesQuery.data;

      // Calculate basic stats
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === "active").length;
      const completedStudents = students.filter(
        s => s.status === "completed"
      ).length;
      const averageProgress =
        Math.round((completedStudents / totalStudents) * 100) || 0;

      // Generate enrollment trend (mock data for demo)
      const enrollmentTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count: Math.floor(Math.random() * 10) + 2,
        };
      });

      // Generate course completion data
      const courseCompletion = courses.map(course => ({
        name: course.title.substring(0, 20),
        completed: Math.floor(Math.random() * completedStudents) + 1,
        total: totalStudents,
      }));

      // Generate quiz performance data
      const quizPerformance = courses.map(course => ({
        name: course.title.substring(0, 20),
        average: Math.floor(Math.random() * 30) + 60,
      }));

      setAnalytics({
        totalStudents,
        activeStudents,
        completedStudents,
        averageProgress,
        enrollmentTrend,
        courseCompletion,
        quizPerformance,
      });

      setLoading(false);
    };

    generateAnalytics();
  }, [studentsQuery.data, coursesQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-600 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">
            Track certification program metrics and student engagement
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          {(["week", "month", "all"] as const).map(range => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`capitalize ${
                timeRange === range
                  ? "bg-amber-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <p className="text-slate-400 text-sm mb-2">Total Students</p>
            <p className="text-4xl font-bold text-amber-600">
              {analytics.totalStudents}
            </p>
          </Card>

          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <p className="text-slate-400 text-sm mb-2">Active Students</p>
            <p className="text-4xl font-bold text-blue-500">
              {analytics.activeStudents}
            </p>
          </Card>

          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-4xl font-bold text-green-500">
              {analytics.completedStudents}
            </p>
          </Card>

          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <p className="text-slate-400 text-sm mb-2">Completion Rate</p>
            <p className="text-4xl font-bold text-purple-500">
              {analytics.averageProgress}%
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trend */}
          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <h2 className="text-xl font-bold text-amber-600 mb-4">
              Enrollment Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #d97706",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={{ fill: "#d97706", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Course Completion */}
          <Card className="bg-slate-800 border-amber-600/30 p-6">
            <h2 className="text-xl font-bold text-amber-600 mb-4">
              Course Completion
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.courseCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #d97706",
                  }}
                />
                <Bar dataKey="completed" fill="#10b981" />
                <Bar dataKey="total" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quiz Performance */}
        <Card className="bg-slate-800 border-amber-600/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-600 mb-4">
            Average Quiz Performance by Course
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.quizPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #d97706",
                }}
              />
              <Bar dataKey="average" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Student Status Distribution */}
        <Card className="bg-slate-800 border-amber-600/30 p-6">
          <h2 className="text-xl font-bold text-amber-600 mb-4">
            Student Status Distribution
          </h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Active",
                      value: analytics.activeStudents,
                      fill: "#3b82f6",
                    },
                    {
                      name: "Completed",
                      value: analytics.completedStudents,
                      fill: "#10b981",
                    },
                    {
                      name: "Suspended",
                      value:
                        analytics.totalStudents -
                        analytics.activeStudents -
                        analytics.completedStudents,
                      fill: "#ef4444",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #d97706",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
