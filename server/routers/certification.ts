import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as certDb from "../services/certificationDb";
import {
  generateCertificatePDF,
  generateCertificateNumber,
} from "../services/certificateGenerator";
import { TRPCError } from "@trpc/server";

export const certificationRouter = router({
  // Authentication
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await certDb.getStudentByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const student = await certDb.createStudent(
        input.email,
        input.name,
        input.password
      );
      if (!student) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create student",
        });
      }

      return { id: student.id, email: student.email, name: student.name };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const valid = await certDb.verifyStudentPassword(
        input.email,
        input.password
      );
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const student = await certDb.getStudentByEmail(input.email);
      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      return { id: student.id, email: student.email, name: student.name };
    }),

  // Courses
  getCourses: publicProcedure.query(async () => {
    return await certDb.getAllCourses();
  }),

  getCourseById: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const course = await certDb.getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      return course;
    }),

  // Course sections
  getCourseSections: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getSectionsByCourseId(input.courseId);
    }),

  getSectionById: publicProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      const section = await certDb.getSectionById(input.sectionId);
      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      return section;
    }),

  // Quizzes
  getQuizzesBySection: publicProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getQuizzesBySectionId(input.sectionId);
    }),

  getQuizById: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      const quiz = await certDb.getQuizById(input.quizId);
      if (!quiz) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
      }
      return quiz;
    }),

  getQuizQuestions: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input }) => {
      const questions = await certDb.getQuestionsByQuizId(input.quizId);
      return questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      }));
    }),

  getFinalExam: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getFinalExamByCourseId(input.courseId);
    }),

  // Quiz submission
  submitQuiz: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        quizId: z.number(),
        answers: z.record(z.string(), z.unknown()),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const quiz = await certDb.getQuizById(input.quizId);
      if (!quiz) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
      }

      const questions = await certDb.getQuestionsByQuizId(input.quizId);
      let score = 0;
      let totalPoints = 0;
      const feedback: Record<
        string | number,
        { correct: boolean; explanation: string }
      > = {};

      for (const question of questions) {
        totalPoints += question.points;
        const studentAnswer = String(
          input.answers[question.id.toString()] || ""
        );

        // Simple answer checking (can be enhanced for different question types)
        const isCorrect = studentAnswer === String(question.correctAnswer);
        if (isCorrect) {
          score += question.points;
        }

        feedback[String(question.id)] = {
          correct: isCorrect,
          explanation: question.explanation || "",
        };
      }

      const passed = (score / totalPoints) * 100 >= quiz.passingScore;

      // Convert answers to string values
      const answersForDb: Record<string, string> = {};
      for (const [key, value] of Object.entries(input.answers)) {
        answersForDb[key] = String(value);
      }

      await certDb.recordQuizAttempt(
        input.studentId,
        input.quizId,
        score,
        totalPoints,
        answersForDb,
        passed,
        input.timeSpent
      );

      return {
        score,
        totalPoints,
        percentage:
          totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
        passed,
        feedback,
      };
    }),

  // Student progress
  getStudentProgress: publicProcedure
    .input(z.object({ studentId: z.number(), courseId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getStudentProgress(input.studentId, input.courseId);
    }),

  updateSectionProgress: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        sectionId: z.number(),
        score: z.number(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await certDb.updateStudentProgress(
        input.studentId,
        input.courseId,
        input.sectionId,
        input.score,
        input.completed
      );

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update progress",
        });
      }

      return { success: true };
    }),

  // Certificates
  issueCertificate: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        finalScore: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const certificateNumber = await certDb.issueCertificate(
        input.studentId,
        input.courseId,
        input.finalScore
      );

      if (!certificateNumber) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to issue certificate",
        });
      }

      return { certificateNumber };
    }),

  getCertificate: publicProcedure
    .input(z.object({ studentId: z.number(), courseId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getCertificateByStudent(
        input.studentId,
        input.courseId
      );
    }),

  // Admin functions
  getAllStudents: publicProcedure.query(async () => {
    return await certDb.getAllStudents();
  }),

  getStudentCourseProgress: publicProcedure
    .input(z.object({ studentId: z.number(), courseId: z.number() }))
    .query(async ({ input }) => {
      return await certDb.getStudentCourseProgress(
        input.studentId,
        input.courseId
      );
    }),

  // Certificate generation
  generateCertificatePDF: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        studentName: z.string(),
        courseName: z.string(),
        score: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const certificateNumber = generateCertificateNumber();
      const pdfBuffer = await generateCertificatePDF({
        studentName: input.studentName,
        courseName: input.courseName,
        completionDate: new Date(),
        score: input.score,
        certificateNumber,
      });

      // Convert buffer to base64 for transmission
      const base64 = pdfBuffer.toString("base64");
      return {
        success: true,
        certificateNumber,
        pdfBase64: base64,
        fileName: `MineTrans-Certificate-${input.studentId}-${certificateNumber}.pdf`,
      };
    }),
});
