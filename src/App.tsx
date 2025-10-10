import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ApplicationForm from './pages/ApplicationForm';
import MyApplications from './pages/MyApplications';
import CitizenApplicationDetail from './pages/CitizenApplicationDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import ApplicationsManagement from './pages/ApplicationsManagement';
import ApplicationDetail from './pages/ApplicationDetail';
import CreateApplication from './pages/CreateApplication';
import PayoutsManagement from './pages/PayoutsManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import ReportsPage from './pages/ReportsPage';
import ProgramsPage from './pages/ProgramsPage';
import UsersManagement from './pages/admin/UsersManagement';
import SystemSettings from './pages/admin/SystemSettings';
import { UserRole } from './types';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={
            <>
              <Header />
              <main className="flex-1">
                <Homepage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/apply" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.CITIZEN]}>
                <Header />
                <main className="flex-1">
                  <ApplicationForm />
                </main>
                <Footer />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/application-form" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.CITIZEN]}>
                <Header />
                <main className="flex-1">
                  <ApplicationForm />
                </main>
                <Footer />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/my-applications" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.CITIZEN]}>
                <Header />
                <main className="flex-1">
                  <MyApplications />
                </main>
                <Footer />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/applications/:id" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.CITIZEN]}>
                <Header />
                <main className="flex-1">
                  <CitizenApplicationDetail />
                </main>
                <Footer />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/dashboard" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <OfficerDashboard />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/applications" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <ApplicationsManagement />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/applications/:id" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <ApplicationDetail />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/create-application" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <CreateApplication />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/payouts" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <PayoutsManagement />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/complaints" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <ComplaintsManagement />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/officer/reports" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                <ReportsPage />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/programs" element={
            <>
              <Header />
              <main className="flex-1">
                <ProgramsPage />
              </main>
              <Footer />
            </>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <UsersManagement />
              </RoleGuard>
            </ProtectedRoute>
          } />

          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <SystemSettings />
              </RoleGuard>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App
