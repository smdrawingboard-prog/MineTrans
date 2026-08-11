import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
      const activeStudents = students.filter((s) => s.status === "active").length;
      const completedStudents = students.filter((s) => s.status === "completed").length;
      const averageProgress = Math.round((completedStudents / totalStudents) * 100) || 0;

      // Generate enrollment trend (mock data for demo)
      const enrollmentTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: Math.floor(Math.random() * 10) + 2,
        };
      });

      // Generate course completion data
      const courseCompletion = courses.map((course) => ({
        name: course.title.substring(0, 20),
        completed: Math.floor(Math.random() * completedStudents) + 1,
        total: totalStudents,
      }));

      // Generate quiz performance data
      const quizPerformance = courses.map((course) => ({
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track certification program metrics and student engagement</p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          {(["week", "month", "all"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "secondary"}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Students</p>
            <p className="text-4xl text-primary">{analytics.totalStudents}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Active Students</p>
            <p className="text-4xl text-foreground">{analytics.activeStudents}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Completed</p>
            <p className="text-4xl text-green-500">{analytics.completedStudents}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Completion Rate</p>
            <p className="text-4xl text-primary">{analytics.averageProgress}%</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollment Trend */}
          <Card className="p-6">
            <h2 className="text-xl text-primary mb-4">Enrollment Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a383d" />
                <XAxis dataKey="date" stroke="#c9cace" />
                <YAxis stroke="#c9cace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1d20",
                    border: "1px solid rgba(173,106,61,0.4)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#c9854f"
                  strokeWidth={2}
                  dot={{ fill: "#c9854f", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Course Completion */}
          <Card className="p-6">
            <h2 className="text-xl text-primary mb-4">Course Completion</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.courseCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a383d" />
                <XAxis dataKey="name" stroke="#c9cace" />
                <YAxis stroke="#c9cace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1d20",
                    border: "1px solid rgba(173,106,61,0.4)",
                  }}
                />
                <Bar dataKey="completed" fill="#c9854f" />
                <Bar dataKey="total" fill="#3a383d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quiz Performance */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl text-primary mb-4">Average Quiz Performance by Course</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.quizPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a383d" />
              <XAxis dataKey="name" stroke="#c9cace" />
              <YAxis stroke="#c9cace" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1d20",
                  border: "1px solid rgba(173,106,61,0.4)",
                }}
              />
              <Bar dataKey="average" fill="#c9854f" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Student Status Distribution */}
        <Card className="p-6">
          <h2 className="text-xl text-primary mb-4">Student Status Distribution</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: analytics.activeStudents, fill: "#c9854f" },
                    { name: "Completed", value: analytics.completedStudents, fill: "#f7f5f1" },
                    {
                      name: "Suspended",
                      value: analytics.totalStudents - analytics.activeStudents - analytics.completedStudents,
                      fill: "#e04b4b",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  <Cell fill="#c9854f" />
                  <Cell fill="#f7f5f1" />
                  <Cell fill="#e04b4b" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1d20",
                    border: "1px solid rgba(173,106,61,0.4)",
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
