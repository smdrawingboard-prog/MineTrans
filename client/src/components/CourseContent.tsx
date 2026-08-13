import React from 'react';
import { CourseReveal } from './CourseReveal';

interface ContentBlock {
  t: 'p' | 'list' | 'note' | 'formula' | 'twocol' | 'table' | 'groupedlist' | 'image';
  v?: string | string[];
  h?: string;
  head?: string[];
  rows?: (string | number)[][];
  heading?: string;
  groups?: { h: string; items: string[] }[];
  footer?: string;
  a?: { h: string; items: string[] };
  b?: { h: string; items: string[] };
  src?: string;
  alt?: string;
  caption?: string;
}

interface CourseContentProps {
  blocks: ContentBlock[];
}

const C = {
  onyx: '#0A0A0B',
  graphite: '#1E1D20',
  graphite2: '#3A383D',
  platinum: '#C9CACE',
  copper: '#AD6A3D',
  bone: '#F7F5F1',
};

export const CourseContent: React.FC<CourseContentProps> = ({ blocks }) => {
  return (
    <div style={{ color: C.platinum, lineHeight: 1.8 }}>
      {blocks.map((block, idx) => (
        <CourseReveal key={idx} delayMs={Math.min(idx, 5) * 70}>
          {renderBlock(block, idx)}
        </CourseReveal>
      ))}
    </div>
  );
};

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.t) {
          case 'image':
            return (
              <figure
                key={idx}
                style={{
                  margin: '0 0 1.5rem',
                  border: `1px solid ${C.graphite2}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={block.src}
                  alt={block.alt || ''}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'clamp(180px, 28vw, 340px)',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {block.caption && (
                  <figcaption
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '12px 18px',
                      background:
                        'linear-gradient(180deg, transparent, rgba(10,10,11,.92))',
                      color: C.platinum,
                      fontSize: '0.78rem',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case 'p':
            return (
              <p
                key={idx}
                style={{
                  marginBottom: '1.5rem',
                  fontSize: '1rem',
                  color: C.platinum,
                }}
              >
                {block.v}
              </p>
            );

          case 'list':
            return (
              <ul
                key={idx}
                style={{
                  marginBottom: '1.5rem',
                  marginLeft: '2rem',
                  color: C.platinum,
                }}
              >
                {Array.isArray(block.v) &&
                  block.v.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      {item}
                    </li>
                  ))}
              </ul>
            );

          case 'note':
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: C.graphite2,
                  border: `1px solid ${C.copper}`,
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  borderRadius: '4px',
                  color: C.platinum,
                  fontSize: '0.95rem',
                }}
              >
                <strong style={{ color: C.copper }}>Note:</strong> {block.v}
              </div>
            );

          case 'formula':
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: C.graphite,
                  border: `1px solid ${C.copper}`,
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  color: C.copper,
                  fontSize: '1.1rem',
                  textAlign: 'center',
                }}
              >
                {block.v}
              </div>
            );

          case 'table':
            return (
              <div
                key={idx}
                style={{
                  overflowX: 'auto',
                  marginBottom: '1.5rem',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: C.graphite,
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.graphite2 }}>
                      {block.head?.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '0.75rem',
                            textAlign: 'left',
                            color: C.copper,
                            borderBottom: `2px solid ${C.copper}`,
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows?.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          backgroundColor:
                            i % 2 === 0 ? C.graphite : C.graphite2,
                          borderBottom: `1px solid ${C.graphite2}`,
                        }}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            style={{
                              padding: '0.75rem',
                              color: C.platinum,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'twocol':
            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h4 style={{ color: C.copper, marginBottom: '1rem' }}>
                    {block.a?.h}
                  </h4>
                  <ul style={{ marginLeft: '1.5rem', color: C.platinum }}>
                    {block.a?.items.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: C.copper, marginBottom: '1rem' }}>
                    {block.b?.h}
                  </h4>
                  <ul style={{ marginLeft: '1.5rem', color: C.platinum }}>
                    {block.b?.items.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );

          case 'groupedlist':
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: C.graphite,
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  borderRadius: '4px',
                  border: `1px solid ${C.graphite2}`,
                }}
              >
                {block.heading && (
                  <h4
                    style={{
                      color: C.copper,
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                    }}
                  >
                    {block.heading}
                  </h4>
                )}
                {block.groups?.map((group, i) => (
                  <div key={i} style={{ marginBottom: '1.5rem' }}>
                    <h5
                      style={{
                        color: C.copper,
                        marginBottom: '0.5rem',
                        fontSize: '1rem',
                      }}
                    >
                      {group.h}
                    </h5>
                    <ul
                      style={{
                        marginLeft: '1.5rem',
                        color: C.platinum,
                      }}
                    >
                      {group.items.map((item, j) => (
                        <li key={j} style={{ marginBottom: '0.3rem' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {block.footer && (
                  <p
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${C.graphite2}`,
                      color: C.platinum,
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {block.footer}
                  </p>
                )}
              </div>
            );

          default:
            return null;
  }
}
