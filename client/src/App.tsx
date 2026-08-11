import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Route-level code splitting: each page ships as its own chunk, fetched
// only when its route is visited, instead of one ~1MB bundle up front
// (recharts in AnalyticsDashboard is the single biggest contributor).
const Home = lazy(() => import("./pages/Home"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StudentPortal = lazy(() => import("./pages/StudentPortal"));
const FinalExam = lazy(() => import("./pages/FinalExam"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const CourseViewer = lazy(() => import("./pages/CourseViewer"));
const QuizInterface = lazy(() => import("./pages/QuizInterface"));
const CoursePlayer = lazy(() => import("./pages/CoursePlayer"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path={"/"} component={Home} />

        <Route path={"/certification/admin/login"} component={AdminLogin} />
        <Route path={"/certification/admin/dashboard"} component={AdminDashboard} />
        <Route path={"/certification/dashboard"} component={StudentPortal} />
        <Route path={"/certification/exam/:courseId"} component={FinalExam} />
        <Route path={"/certification/analytics"} component={AnalyticsDashboard} />
        <Route path={"/certification/course/:courseId"} component={CourseViewer} />
        <Route path={"/certification/quiz/:courseId"} component={QuizInterface} />
        <Route path={"/certification/course"} component={CoursePlayer} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
