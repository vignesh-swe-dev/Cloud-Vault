import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import DashboardPage from './pages/DashboardPage'
import FilesPage from './pages/FilesPage'
import TrashPage from './pages/TrashPage'
import FavoritesPage from './pages/FavoritesPage'
import SharesPage from './pages/SharesPage'
import EditorPage from './pages/EditorPage'
import SharedFilePage from './pages/SharedFilePage'
import StoragePage from './pages/StoragePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/shared/:token" element={<SharedFilePage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/files/:folderId" element={<FilesPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/shares" element={<SharesPage />} />
        <Route path="/storage" element={<StoragePage />} />
        <Route path="/editor/:fileId" element={<EditorPage />} />
        <Route path="/editor/new" element={<EditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
