import React, { useEffect, useState } from 'react';
import { CourseSidebar } from './CourseSidebar';
import { CourseContent } from './CourseContent';
import { CourseIcon, type IconKey } from './CourseIcons';

interface CourseModule {
  id: string;
  n: number;
  title: string;
  section: string;
  icon?: IconKey;
  blocks: any[];
}

const PROGRESS_KEY = 'mt-course-completed-modules';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
}

interface CourseLayoutProps {
  modules: CourseModule[];
  title: string;
}

const C = {
  onyx: '#0A0A0B',
  graphite: '#1E1D20',
  graphite2: '#3A383D',
  platinum: '#C9CACE',
  copper: '#AD6A3D',
  bone: '#F7F5F1',
};

export const CourseLayout: React.FC<CourseLayoutProps> = ({
  modules,
  title,
}) => {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id || '');
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());
  const activeModule = modules.find((m) => m.id === activeModuleId);
  const activeIndex = modules.findIndex((m) => m.id === activeModuleId);
  const percent = modules.length
    ? Math.round(((activeIndex + 1) / modules.length) * 100)
    : 0;

  // Mark the currently viewed module as completed once it's been seen.
  useEffect(() => {
    if (!activeModuleId) return;
    setCompleted((prev) => {
      if (prev.has(activeModuleId)) return prev;
      const next = new Set(prev);
      next.add(activeModuleId);
      saveCompleted(next);
      return next;
    });
  }, [activeModuleId]);

  const sidebarItems = modules.map((m) => ({
    id: m.id,
    title: `${m.n}. ${m.title}`,
    section: m.section,
    icon: m.icon,
  }));

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: C.onyx,
      }}
    >
      <CourseSidebar
        items={sidebarItems}
        activeId={activeModuleId}
        onSelect={setActiveModuleId}
        completedIds={completed}
      />

      <main
        style={{
          flex: 1,
          padding: '3rem',
          backgroundColor: C.onyx,
          color: C.platinum,
          overflowY: 'auto',
          maxHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              color: C.bone,
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: C.platinum,
              marginBottom: '3rem',
              fontSize: '1rem',
            }}
          >
            {activeModule?.section}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.5rem',
                fontSize: '0.8rem',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: C.platinum,
              }}
            >
              <span>
                Module {activeIndex + 1} of {modules.length}
              </span>
              <span style={{ color: C.copper }}>{percent}% through the course</span>
            </div>
            <div
              style={{
                height: '3px',
                background: C.graphite2,
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${C.copper}, #C9854F)`,
                  transition: 'width 0.5s cubic-bezier(.22,.9,.3,1)',
                }}
              />
            </div>

            <h2
              style={{
                fontSize: '2rem',
                color: C.copper,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {activeModule?.icon && (
                <span
                  style={{
                    display: 'inline-flex',
                    color: C.copper,
                    flexShrink: 0,
                  }}
                >
                  <CourseIcon icon={activeModule.icon} size={28} />
                </span>
              )}
              {activeModule?.n}. {activeModule?.title}
            </h2>
          </div>

          {activeModule && (
            <div
              key={activeModule.id}
              style={{ animation: 'mt-course-fade-in 0.4s cubic-bezier(.22,.9,.3,1)' }}
            >
              <style>{`
                @keyframes mt-course-fade-in {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: none; }
                }
              `}</style>
              <CourseContent blocks={activeModule.blocks} />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: `1px solid ${C.graphite2}`,
            }}
          >
            <button
              onClick={() => {
                const currentIndex = modules.findIndex(
                  (m) => m.id === activeModuleId
                );
                if (currentIndex > 0) {
                  setActiveModuleId(modules[currentIndex - 1].id);
                }
              }}
              disabled={modules[0].id === activeModuleId}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor:
                  modules[0].id === activeModuleId ? C.graphite2 : C.copper,
                color: C.onyx,
                border: 'none',
                borderRadius: '4px',
                cursor:
                  modules[0].id === activeModuleId ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: modules[0].id === activeModuleId ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>

            <button
              onClick={() => {
                const currentIndex = modules.findIndex(
                  (m) => m.id === activeModuleId
                );
                if (currentIndex < modules.length - 1) {
                  setActiveModuleId(modules[currentIndex + 1].id);
                }
              }}
              disabled={modules[modules.length - 1].id === activeModuleId}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor:
                  modules[modules.length - 1].id === activeModuleId
                    ? C.graphite2
                    : C.copper,
                color: C.onyx,
                border: 'none',
                borderRadius: '4px',
                cursor:
                  modules[modules.length - 1].id === activeModuleId
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: '1rem',
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
