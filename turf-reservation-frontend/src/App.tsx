import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManagePlayers from "@/pages/admin/player-management/ManagePlayers";
import SoloPlayerHandling from "@/pages/admin/player-management/SoloPlayerHandling";
import CoachManagement from "@/pages/admin/CoachManagement";
import BookingApprovals from "@/pages/admin/BookingApprovals";
import SlotManagement from "@/pages/admin/SlotManagement";
import ReportsAnalytics from "@/pages/admin/reports-analytics/ReportsAnalytics";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import CoachSchedule from "@/pages/coach/CoachSchedule";
import CoachRequests from "@/pages/coach/CoachRequests";
import CoachAvailability from "@/pages/coach/CoachAvailability";
import PlayerDashboard from "@/pages/player/PlayerDashboard";
import MakeReservation from "@/pages/player/MakeReservation";
import JoinSoloPool from "@/pages/player/JoinSoloPool";
import FindTeam from "@/pages/player/FindTeam";
import EventHosting from "@/pages/player/EventHosting";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ROUTES } from "@/constants";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          {/* Protected Routes with Role-Based Access Control */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PLAYERS_MANAGE}
            element={
              <ProtectedRoute requiredRole="admin">
                <ManagePlayers />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SOLO_POOL}
            element={
              <ProtectedRoute requiredRole="admin">
                <SoloPlayerHandling />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_COACHES_MANAGE}
            element={
              <ProtectedRoute requiredRole="admin">
                <CoachManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_BOOKING_APPROVALS}
            element={
              <ProtectedRoute requiredRole="admin">
                <BookingApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SLOTS_MANAGE}
            element={
              <ProtectedRoute requiredRole="admin">
                <SlotManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_REPORTS}
            element={
              <ProtectedRoute requiredRole="admin">
                <ReportsAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COACH_DASHBOARD}
            element={
              <ProtectedRoute requiredRole="coach">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COACH_SCHEDULE}
            element={
              <ProtectedRoute requiredRole="coach">
                <CoachSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COACH_REQUESTS}
            element={
              <ProtectedRoute requiredRole="coach">
                <CoachRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COACH_AVAILABILITY}
            element={
              <ProtectedRoute requiredRole="coach">
                <CoachAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PLAYER_DASHBOARD}
            element={
              <ProtectedRoute requiredRole="player">
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.MAKE_RESERVATION}
            element={
              <ProtectedRoute requiredRole="player">
                <MakeReservation />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.JOIN_SOLO_POOL}
            element={
              <ProtectedRoute requiredRole="player">
                <JoinSoloPool />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.FIND_TEAM}
            element={
              <ProtectedRoute requiredRole="player">
                <FindTeam />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.HOST_EVENT}
            element={
              <ProtectedRoute requiredRole="player">
                <EventHosting />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
