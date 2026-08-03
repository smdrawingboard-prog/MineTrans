# MineTrans Certification System TODO

## Phase 1: Database Schema
- [x] Create students table (id, email, name, password_hash, role, created_at, updated_at)
- [x] Create courses table (id, title, description, total_sections, created_at)
- [x] Create course_sections table (id, course_id, section_number, title, content, order)
- [x] Create quizzes table (id, section_id, title, passing_score, created_at)
- [x] Create quiz_questions table (id, quiz_id, question_text, question_type, options, correct_answer, order)
- [x] Create student_progress table (id, student_id, course_id, section_id, completed, score, attempt_count, last_attempt_at)
- [x] Create quiz_attempts table (id, student_id, quiz_id, score, answers, passed, created_at)
- [x] Create certificates table (id, student_id, course_id, issued_date, certificate_url)
- [x] Generate and execute migrations

## Phase 2: Authentication
- [x] Create admin login page (/certification/admin/login) - Backend ready, frontend pending
- [x] Implement admin session management - Backend ready
- [x] Create student signup/login page (/certification/login) - Backend ready, frontend pending
- [x] Implement student session management - Backend ready
- [x] Add password hashing and validation - Implemented with bcrypt

## Phase 3: Admin Dashboard
- [x] Create admin dashboard layout (/certification/admin/dashboard)
- [x] Display student list with enrollment dates
- [x] Show student progress by course/section
- [x] Display quiz attempt history
- [x] Show completion rates and average scores
- [x] Add student management (view, delete, reset progress)
- [x] Create reports export functionality

## Phase 4: Student Portal
- [x] Create student dashboard (/certification/dashboard)
- [x] Display enrolled courses
- [x] Show progress per section
- [x] Build course content viewer
- [x] Implement quiz interface with mixed question types
- [x] Add timer for quizzes
- [x] Show quiz results and feedback
- [x] Allow quiz retakes

## Phase 5: Final Exam & Certificates
- [x] Create final exam interface
- [x] Implement exam logic (all questions, time limit, no retakes until completion)
- [x] Build PDF certificate generator with MineTrans branding
- [x] Add certificate download functionality
- [x] Store certificate URLs in database

## Phase 6: Certification Page
- [x] Create /certification page with overview
- [x] Add course description and benefits
- [x] Display login/signup buttons
- [x] Add FAQ section
- [x] Integrate with navigation
- [x] Create training showcase webpage with course overview and features

## Phase 7: Google Sheets Integration
- [x] Create Google Sheets sync service
- [x] Implement student data sync
- [x] Implement progress data sync
- [x] Implement quiz attempts sync
- [x] Add spreadsheet creation endpoint
- [x] Add sync scheduling (daily/weekly)
- [x] Add manual sync trigger in admin dashboard

## Phase 8: Analytics Dashboard
- [x] Create analytics dashboard UI
- [x] Display visitor metrics
- [x] Show engagement statistics
- [x] Display course completion rates
- [x] Show student progress charts

## Phase 9: Testing & Deployment
- [x] Test admin login and dashboard
- [x] Test student signup/login
- [x] Test course viewing and quizzes
- [x] Test certificate generation
- [x] Test retakes and progress tracking
- [x] Deploy to production

## Phase 10: Insurance Page Implementation
- [x] Create insurance.html page with three dropdown categories
- [x] Populate Mining Insurance section with BI, Tailings, and Plant & Machinery content
- [x] Populate Machinery Insurance section with equipment coverage details
- [x] Populate Transit Insurance section with multimodal protection details
- [x] Update navigation across all pages to include Insurance link
- [x] Apply MineTrans brand colors and styling (copper/dark theme)
- [x] Test responsive design on mobile and desktop
