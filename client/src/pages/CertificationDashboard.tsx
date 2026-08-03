import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Student {
  id: number;
  email: string;
  name: string;
}

export default function CertificationDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const coursesQuery = trpc.certification.getCourses.useQuery();

  useEffect(() => {
    // Get student from localStorage
    const stored = localStorage.getItem("certStudent");
    if (!stored) {
      window.location.href = "/certification";
      return;
    }
    setStudent(JSON.parse(stored));
    
    // Load courses
    if (coursesQuery.data) {
      setCourses(coursesQuery.data);
    }
    setLoading(false);
  }, [coursesQuery.data]);

  const handleLogout = () => {
    localStorage.removeItem("certStudent");
    window.location.href = "/certification";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-600/30 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-600 mb-1">MineTrans Certification</h1>
            <p className="text-slate-400">Welcome, {student?.name}</p>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">No courses available yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="bg-slate-800 border-amber-600/30 hover:border-amber-600/60 transition cursor-pointer"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-600 mb-2">{course.title}</h3>
                    <p className="text-slate-400 mb-4">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {course.totalSections} sections
                      </span>
                      <Button
                        onClick={() => {
                          window.location.href = `/certification/course/${course.id}`;
                        }}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Start Course
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-slate-400">Complete courses to track your progress here.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
