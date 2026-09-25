import { Route, Routes } from "react-router-dom";
import { MainPage } from "./pages/MainPage/MainPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { SignupPage } from "./pages/SignupPage/SignupPage";
import { QuestionListPage } from "./pages/QuestionListPage/QuestionListPage";
import { QuestionDetailPage } from "./pages/QuestionDetailPage/QuestionDetailPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

/** contracts/routes.md — 5개 경로. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/questions"
        element={
          <ProtectedRoute>
            <QuestionListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/questions/new"
        element={
          <ProtectedRoute>
            <QuestionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/questions/:id"
        element={
          <ProtectedRoute>
            <QuestionDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
