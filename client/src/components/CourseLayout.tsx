import React, { useState } from "react";
import { CourseSidebar } from "./CourseSidebar";
import { CourseContent } from "./CourseContent";

interface CourseModule {
  id: string;
  n: number;
  title: string;
  section: string;
  blocks: any[];
}

interface CourseLayoutProps {
  modules: CourseModule[];
  title: string;
}

const C = {
  onyx: "#0A0A0B",
  graphite: "#1E1D20",
  graphite2: "#3A383D",
  platinum: "#C9CACE",
  copper: "#AD6A3D",
  bone: "#F7F5F1",
};

export const CourseLayout: React.FC<CourseLayoutProps> = ({
  modules,
  title,
}) => {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id || "");
  const activeModule = modules.find(m => m.id === activeModuleId);

  const sidebarItems = modules.map(m => ({
    id: m.id,
    title: `${m.n}. ${m.title}`,
    section: m.section,
  }));

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: C.onyx,
      }}
    >
      <CourseSidebar
        items={sidebarItems}
        activeId={activeModuleId}
        onSelect={setActiveModuleId}
      />

      <main
        style={{
          flex: 1,
          padding: "3rem",
          backgroundColor: C.onyx,
          color: C.platinum,
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              color: C.bone,
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: C.platinum,
              marginBottom: "3rem",
              fontSize: "1rem",
            }}
          >
            {activeModule?.section}
          </p>

          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "2rem",
                color: C.copper,
                marginBottom: "1.5rem",
              }}
            >
              {activeModule?.n}. {activeModule?.title}
            </h2>
          </div>

          {activeModule && <CourseContent blocks={activeModule.blocks} />}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: `1px solid ${C.graphite2}`,
            }}
          >
            <button
              onClick={() => {
                const currentIndex = modules.findIndex(
                  m => m.id === activeModuleId
                );
                if (currentIndex > 0) {
                  setActiveModuleId(modules[currentIndex - 1].id);
                }
              }}
              disabled={modules[0].id === activeModuleId}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor:
                  modules[0].id === activeModuleId ? C.graphite2 : C.copper,
                color: C.onyx,
                border: "none",
                borderRadius: "4px",
                cursor:
                  modules[0].id === activeModuleId ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                opacity: modules[0].id === activeModuleId ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>

            <button
              onClick={() => {
                const currentIndex = modules.findIndex(
                  m => m.id === activeModuleId
                );
                if (currentIndex < modules.length - 1) {
                  setActiveModuleId(modules[currentIndex + 1].id);
                }
              }}
              disabled={modules[modules.length - 1].id === activeModuleId}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor:
                  modules[modules.length - 1].id === activeModuleId
                    ? C.graphite2
                    : C.copper,
                color: C.onyx,
                border: "none",
                borderRadius: "4px",
                cursor:
                  modules[modules.length - 1].id === activeModuleId
                    ? "not-allowed"
                    : "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                opacity:
                  modules[modules.length - 1].id === activeModuleId ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
