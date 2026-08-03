import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CertificationDashboard from "./pages/CertificationDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentPortal from "./pages/StudentPortal";
import FinalExam from "./pages/FinalExam";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import CourseViewer from "./pages/CourseViewer";
import QuizInterface from "./pages/QuizInterface";
import CoursePlayer from "./pages/CoursePlayer";

function Router() {
  return (
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
        defaultTheme="light"
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
