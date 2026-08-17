import React from 'react';
import { CourseIcon, type IconKey } from './CourseIcons';

interface SidebarItem {
  id: string;
  title: string;
  section: string;
  icon?: IconKey;
}

interface CourseSidebarProps {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  completedIds?: Set<string>;
}

const C = {
  onyx: '#0A0A0B',
  graphite: '#1E1D20',
  graphite2: '#3A383D',
  platinum: '#C9CACE',
  copper: '#AD6A3D',
  bone: '#F7F5F1',
};

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  items,
  activeId,
  onSelect,
  completedIds,
}) => {
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, SidebarItem[]>
  );

  const doneCount = completedIds ? completedIds.size : 0;

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: C.graphite,
        borderRight: `1px solid ${C.graphite2}`,
        padding: '2rem 0',
        overflowY: 'auto',
        maxHeight: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {completedIds && (
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '0.72rem',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: C.platinum,
              marginBottom: '0.4rem',
            }}
          >
            {doneCount} of {items.length} viewed
          </div>
          <div
            style={{
              height: '4px',
              background: C.graphite2,
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${items.length ? (doneCount / items.length) * 100 : 0}%`,
                background: C.copper,
                transition: 'width 0.5s cubic-bezier(.22,.9,.3,1)',
              }}
            />
          </div>
        </div>
      )}

      {Object.entries(groupedItems).map(([section, sectionItems]) => (
        <div key={section} style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              color: C.copper,
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0 1.5rem',
              marginBottom: '1rem',
            }}
          >
            {section}
          </h3>
          {sectionItems.map((item) => {
            const isDone = completedIds?.has(item.id) && item.id !== activeId;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor:
                    activeId === item.id ? C.graphite2 : 'transparent',
                  border: 'none',
                  borderLeft:
                    activeId === item.id ? `3px solid ${C.copper}` : '3px solid transparent',
                  color: activeId === item.id ? C.copper : C.platinum,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  fontWeight: activeId === item.id ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (activeId !== item.id) {
                    e.currentTarget.style.backgroundColor = C.graphite2;
                    e.currentTarget.style.color = C.copper;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeId !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = C.platinum;
                  }
                }}
              >
                {item.icon && (
                  <span style={{ display: 'inline-flex', flexShrink: 0, opacity: activeId === item.id ? 1 : 0.75 }}>
                    <CourseIcon icon={item.icon} size={15} />
                  </span>
                )}
                <span style={{ flex: 1 }}>{item.title}</span>
                {isDone && (
                  <span
                    aria-label="Viewed"
                    style={{
                      flexShrink: 0,
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: C.onyx,
                      background: C.copper,
                      fontSize: '9px',
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
};
