import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  delayMs?: number;
}

/**
 * Fades + slides a block in the moment it mounts. Used to break up the
 * course's long text blocks with light, staggered motion instead of
 * everything appearing at once.
 */
export const CourseReveal: React.FC<RevealProps> = ({ children, delayMs = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, children]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.5s cubic-bezier(.22,.9,.3,1), transform 0.5s cubic-bezier(.22,.9,.3,1)',
      }}
    >
      {children}
    </div>
  );
};
