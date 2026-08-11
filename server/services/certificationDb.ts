import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  certificationStudents,
  certificationCourses,
  courseSections,
  quizzes,
  quizQuestions,
  studentProgress,
  quizAttempts,
  certificates,
  InsertCertificationStudent,
  CertificationStudent,
} from "../../drizzle/schema";
import { ENV } from "../_core/env";
import bcrypt from "bcrypt";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Certification DB] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Student authentication
export async function createStudent(
  email: string,
  name: string,
  password: string
): Promise<CertificationStudent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.insert(certificationStudents).values({
      email,
      name,
      passwordHash,
    });

    return await getStudentByEmail(email);
  } catch (error) {
    console.error("[Certification DB] Failed to create student:", error);
    return null;
  }
}

export async function getStudentByEmail(
  email: string
): Promise<CertificationStudent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(certificationStudents)
      .where(eq(certificationStudents.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get student:", error);
    return null;
  }
}

export async function getStudentById(
  id: number
): Promise<CertificationStudent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(certificationStudents)
      .where(eq(certificationStudents.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get student by ID:", error);
    return null;
  }
}

export async function verifyStudentPassword(
  email: string,
  password: string
): Promise<boolean> {
  const student = await getStudentByEmail(email);
  if (!student) return false;

  try {
    return await bcrypt.compare(password, student.passwordHash);
  } catch (error) {
    console.error("[Certification DB] Password verification failed:", error);
    return false;
  }
}

// Course management
export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(certificationCourses)
      .where(eq(certificationCourses.id, courseId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get course:", error);
    return null;
  }
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(certificationCourses);
  } catch (error) {
    console.error("[Certification DB] Failed to get courses:", error);
    return [];
  }
}

// Course sections
export async function getSectionsByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(courseSections)
      .where(eq(courseSections.courseId, courseId))
      .orderBy(courseSections.order);
  } catch (error) {
    console.error("[Certification DB] Failed to get sections:", error);
    return [];
  }
}

export async function getSectionById(sectionId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(courseSections)
      .where(eq(courseSections.id, sectionId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get section:", error);
    return null;
  }
}

// Quizzes
export async function getQuizzesBySectionId(sectionId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.sectionId, sectionId));
  } catch (error) {
    console.error("[Certification DB] Failed to get quizzes:", error);
    return [];
  }
}

export async function getQuizById(quizId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get quiz:", error);
    return null;
  }
}

export async function getFinalExamByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.courseId, courseId), eq(quizzes.isExam, "true")))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get final exam:", error);
    return null;
  }
}

// Quiz questions
export async function getQuestionsByQuizId(quizId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.order);
  } catch (error) {
    console.error("[Certification DB] Failed to get questions:", error);
    return [];
  }
}

// Student progress
export async function getStudentProgress(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.studentId, studentId),
          eq(studentProgress.courseId, courseId)
        )
      );
  } catch (error) {
    console.error("[Certification DB] Failed to get student progress:", error);
    return [];
  }
}

export async function updateStudentProgress(
  studentId: number,
  courseId: number,
  sectionId: number,
  score: number,
  completed: boolean
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.studentId, studentId),
          eq(studentProgress.courseId, courseId),
          eq(studentProgress.sectionId, sectionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(studentProgress)
        .set({
          score,
          completed: completed ? "true" : "false",
          attemptCount: existing[0].attemptCount + 1,
          lastAttemptAt: new Date(),
          completedAt: completed ? new Date() : null,
        })
        .where(eq(studentProgress.id, existing[0].id));
    } else {
      await db.insert(studentProgress).values({
        studentId,
        courseId,
        sectionId,
        score,
        completed: completed ? "true" : "false",
        attemptCount: 1,
        lastAttemptAt: new Date(),
        completedAt: completed ? new Date() : null,
      });
    }

    return true;
  } catch (error) {
    console.error("[Certification DB] Failed to update progress:", error);
    return null;
  }
}

// Quiz attempts
export async function recordQuizAttempt(
  studentId: number,
  quizId: number,
  score: number,
  totalPoints: number,
  answers: Record<string, string>,
  passed: boolean,
  timeSpent?: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(quizAttempts).values({
      studentId,
      quizId,
      score,
      totalPoints,
      answers: JSON.stringify(answers),
      passed: passed ? "true" : "false",
      timeSpent,
    });

    return true;
  } catch (error) {
    console.error("[Certification DB] Failed to record quiz attempt:", error);
    return null;
  }
}

export async function getStudentQuizAttempts(
  studentId: number,
  quizId: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.quizId, quizId)
        )
      )
      .orderBy(quizAttempts.createdAt);
  } catch (error) {
    console.error("[Certification DB] Failed to get quiz attempts:", error);
    return [];
  }
}

// Certificates
export async function issueCertificate(
  studentId: number,
  courseId: number,
  finalScore: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const certificateNumber = `CERT-${Date.now()}-${studentId}`;

    await db.insert(certificates).values({
      studentId,
      courseId,
      certificateNumber,
      finalScore,
    });

    return certificateNumber;
  } catch (error) {
    console.error("[Certification DB] Failed to issue certificate:", error);
    return null;
  }
}

export async function getCertificateByStudent(
  studentId: number,
  courseId: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.studentId, studentId),
          eq(certificates.courseId, courseId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Certification DB] Failed to get certificate:", error);
    return null;
  }
}

// Admin functions
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(certificationStudents);
  } catch (error) {
    console.error("[Certification DB] Failed to get all students:", error);
    return [];
  }
}

export async function getStudentCourseProgress(
  studentId: number,
  courseId: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const progress = await getStudentProgress(studentId, courseId);
    const course = await getCourseById(courseId);
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId));

    return {
      student: await getStudentById(studentId),
      course,
      progress,
      quizAttempts: attempts,
    };
  } catch (error) {
    console.error(
      "[Certification DB] Failed to get student course progress:",
      error
    );
    return null;
  }
}
