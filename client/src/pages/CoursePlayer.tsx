import React, { useEffect, useState } from 'react';
import { CourseLayout } from '@/components/CourseLayout';
import { courseData } from '@/data/courseData';

const C = {
  onyx: '#0A0A0B',
  graphite: '#1E1D20',
  copper: '#AD6A3D',
  bone: '#F7F5F1',
  platinum: '#C9CACE',
};

interface Student {
  id: number;
  email: string;
  name: string;
}

export default function CoursePlayer() {
  const [student, setStudent] = useState<Student | null | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem('certStudent');
    setStudent(stored ? JSON.parse(stored) : null);
  }, []);

  if (student === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: C.onyx,
          color: C.platinum,
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: C.onyx,
          color: C.platinum,
          padding: '2rem',
        }}
      >
        <h1 style={{ color: C.copper, marginBottom: '1rem' }}>
          Access Restricted
        </h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Please log in to access the training course.
        </p>
        <a
          href="/certification"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: C.copper,
            color: C.onyx,
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 600,
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  const allModules = [...courseData.partI, ...courseData.partII];

  return (
    <CourseLayout
      modules={allModules}
      title={courseData.title}
    />
  );
}
