import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * Mining news articles table for the weekly newsletter.
 * Stores headlines, excerpts, and source information from mining publications.
 */
export const miningNews = mysqlTable("mining_news", {
  id: int("id").autoincrement().primaryKey(),
  headline: text("headline").notNull(),
  excerpt: text("excerpt").notNull(),
  publication: varchar("publication", { length: 255 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 2048 }).notNull(),
  publishedAt: timestamp("publishedAt").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  category: varchar("category", { length: 100 }),
});

export type MiningNews = typeof miningNews.$inferSelect;
export type InsertMiningNews = typeof miningNews.$inferInsert;

/**
 * Newsletter subscribers table
 * Tracks email subscribers and their preferences for mining news digests
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  subscribed: mysqlEnum("subscribed", ["true", "false"]).default("true").notNull(),
  categories: text("categories"), // JSON array of interested categories
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }).unique(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * Email log for tracking sent newsletters
 * Records each newsletter sent, status, and any errors
 */
export const emailLog = mysqlTable("email_log", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  subject: text("subject").notNull(),
  articleCount: int("articleCount").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("sent").notNull(), // sent, failed, bounced
  errorMessage: text("errorMessage"),
});

export type EmailLog = typeof emailLog.$inferSelect;
export type InsertEmailLog = typeof emailLog.$inferInsert;

/**
 * Page view analytics table
 * Tracks visitor behavior and engagement metrics
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 255 }).notNull(), // e.g., /news.html, /insights.html
  referrer: varchar("referrer", { length: 2048 }),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * News engagement analytics
 * Tracks which news articles are clicked and viewed
 */
export const newsEngagement = mysqlTable("news_engagement", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // view, click, share
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
  category: varchar("category", { length: 100 }),
});

export type NewsEngagement = typeof newsEngagement.$inferSelect;
export type InsertNewsEngagement = typeof newsEngagement.$inferInsert;

/**
 * Certification students table
 * Stores student accounts for the certification program
 */
export const certificationStudents = mysqlTable("certification_students", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("passwordHash").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["active", "completed", "suspended"]).default("active").notNull(),
});

export type CertificationStudent = typeof certificationStudents.$inferSelect;
export type InsertCertificationStudent = typeof certificationStudents.$inferInsert;

/**
 * Certification courses table
 * Defines the certification courses (e.g., Business Interruption Blueprint)
 */
export const certificationCourses = mysqlTable("certification_courses", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  totalSections: int("totalSections").notNull(),
  passingScore: int("passingScore").default(70).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CertificationCourse = typeof certificationCourses.$inferSelect;
export type InsertCertificationCourse = typeof certificationCourses.$inferInsert;

/**
 * Course sections table
 * Stores individual sections/chapters of a course
 */
export const courseSections = mysqlTable("course_sections", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  sectionNumber: int("sectionNumber").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML content
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseSection = typeof courseSections.$inferSelect;
export type InsertCourseSection = typeof courseSections.$inferInsert;

/**
 * Quizzes table
 * Stores quizzes associated with course sections
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("sectionId").notNull(),
  courseId: int("courseId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  passingScore: int("passingScore").default(70).notNull(),
  timeLimit: int("timeLimit"), // in minutes, null = no limit
  isExam: mysqlEnum("isExam", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz questions table
 * Stores individual questions for quizzes
 */
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "true_false", "short_answer", "calculation"]).notNull(),
  options: text("options"), // JSON array for multiple choice/true false
  correctAnswer: text("correctAnswer").notNull(),
  explanation: text("explanation"),
  points: int("points").default(1).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * Student progress table
 * Tracks student progress through course sections
 */
export const studentProgress = mysqlTable("student_progress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  sectionId: int("sectionId"),
  completed: mysqlEnum("completed", ["true", "false"]).default("false").notNull(),
  score: int("score"),
  attemptCount: int("attemptCount").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = typeof studentProgress.$inferInsert;

/**
 * Quiz attempts table
 * Records each quiz/exam attempt by a student
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  quizId: int("quizId").notNull(),
  score: int("score").notNull(),
  totalPoints: int("totalPoints").notNull(),
  answers: text("answers").notNull(), // JSON object of answers
  passed: mysqlEnum("passed", ["true", "false"]).notNull(),
  timeSpent: int("timeSpent"), // in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Certificates table
 * Stores issued certificates for completed courses
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  certificateNumber: varchar("certificateNumber", { length: 64 }).unique().notNull(),
  issuedDate: timestamp("issuedDate").defaultNow().notNull(),
  certificateUrl: varchar("certificateUrl", { length: 2048 }),
  finalScore: int("finalScore").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
