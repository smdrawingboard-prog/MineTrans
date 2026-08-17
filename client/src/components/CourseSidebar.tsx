import React from 'react';

interface SidebarItem {
  id: string;
  title: string;
  section: string;
}

interface CourseSidebarProps {
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
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
          {sectionItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                width: '100%',
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
              {item.title}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
};
