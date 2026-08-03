import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Student {
  id: number;
  email: string;
  name: string;
}

export default function CourseViewer() {
  const [, params] = useRoute("/certification/course/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const [student, setStudent] = useState<Student | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const courseQuery = trpc.certification.getCourseById.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );
  const sectionsQuery = trpc.certification.getCourseSections.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  useEffect(() => {
    const stored = localStorage.getItem("certStudent");
    if (!stored) {
      window.location.href = "/certification";
      return;
    }
    setStudent(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (sectionsQuery.data) {
      setSections(sectionsQuery.data);
      setLoading(false);
    }
  }, [sectionsQuery.data]);

  if (loading || !courseId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading course...</p>
      </div>
    );
  }

  const course = courseQuery.data;
  const section = sections[currentSection];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-amber-600/30 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => (window.location.href = "/certification/dashboard")}
            variant="ghost"
            className="text-amber-600 hover:text-amber-500 mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-amber-600">{course?.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <div className="p-4">
                <h3 className="font-bold text-amber-600 mb-4">
                  Course Sections
                </h3>
                <div className="space-y-2">
                  {sections.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSection(idx)}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        idx === currentSection
                          ? "bg-amber-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        Section {s.sectionNumber}
                      </div>
                      <div className="text-xs opacity-75">{s.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {section && (
              <Card className="bg-slate-800 border-amber-600/30 p-8">
                <h2 className="text-2xl font-bold text-amber-600 mb-4">
                  Section {section.sectionNumber}: {section.title}
                </h2>
                <div
                  className="prose prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                  <Button
                    onClick={() =>
                      setCurrentSection(Math.max(0, currentSection - 1))
                    }
                    disabled={currentSection === 0}
                    variant="outline"
                    className="border-amber-600 text-amber-600"
                  >
                    ← Previous
                  </Button>

                  <Button
                    onClick={() => {
                      if (currentSection < sections.length - 1) {
                        setCurrentSection(currentSection + 1);
                      } else {
                        // Go to quiz or final exam
                        window.location.href = `/certification/quiz/${courseId}`;
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {currentSection === sections.length - 1
                      ? "Take Quiz →"
                      : "Next →"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
