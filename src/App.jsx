import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserReport from "./pages/UserReport";
import AdminReport from "./pages/AdminReport";
import Trash from "./pages/Trash";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PWABadge from "./components/PWABadge";
import userService from "./services/userService";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || userService.getToken());
  const [user, setUser] = useState(() => userService.getUserProfile());

  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken") || "";
  });

  const [verificationSuccess, setVerificationSuccess] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("verified") === "success";
  });

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetToken")) {
      return "reset-password";
    }
    if (params.get("verified") === "success") {
      return "login";
    }
    // Default directly to dashboard for immediate PWA experience, or check saved role
    try {
      const savedUser = userService.getUserProfile();
      if (savedUser && savedUser.role === "admin") {
        return "admin";
      }
      return "dashboard";
    } catch {
      return "dashboard";
    }
  });

  // Clean up URL query parameters on mount if resetToken or verified was present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetToken") || params.get("verified")) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }

    // Refresh user profile from Supabase database if available
    userService.fetchProfile().then((freshProfile) => {
      if (freshProfile) {
        setUser(freshProfile);
      }
    });
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      userService.saveUserProfile(user);
    }
  }, [user]);

  const handleLoginSuccess = (userToken, userData, enteredPassword = "") => {
    setToken(userToken);
    const mergedUser = { ...userData };
    if (enteredPassword) {
      mergedUser.plaintextPassword = enteredPassword;
    }
    setUser(mergedUser);
    userService.saveUserProfile(mergedUser);
    if (userData.role === "admin") {
      setCurrentPage("admin");
    } else {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    userService.logout();
    setToken("");
    setCurrentPage("landing");
  };

  // State Router
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <LandingPage
            onNavigateLogin={() => setCurrentPage("login")}
            onNavigateRegister={() => setCurrentPage("register")}
          />
        );
      case "login":
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => {
              setVerificationSuccess(false);
              setCurrentPage("register");
            }}
            onNavigateForgotPassword={() => {
              setVerificationSuccess(false);
              setCurrentPage("forgot-password");
            }}
            verificationSuccess={verificationSuccess}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword
            onNavigateLogin={() => {
              setVerificationSuccess(false);
              setCurrentPage("login");
            }}
          />
        );
      case "reset-password":
        return (
          <ResetPassword
            resetToken={resetToken}
            onNavigateLogin={() => {
              setVerificationSuccess(false);
              setCurrentPage("login");
            }}
          />
        );
      case "register":
        return (
          <Register
            onNavigateLogin={() => {
              setVerificationSuccess(false);
              setCurrentPage("login");
            }}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
            onNavigateReport={() => setCurrentPage("report-user")}
            onNavigateTrash={() => setCurrentPage("trash")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      case "trash":
        return (
          <Trash
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
            onNavigateReport={() => setCurrentPage("report-user")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      case "report-user":
        return (
          <UserReport
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
            onNavigateTrash={() => setCurrentPage("trash")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      case "profile":
        return (
          <Dashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
            onNavigateReport={() => setCurrentPage("report-user")}
            onNavigateTrash={() => setCurrentPage("trash")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      case "admin":
        return (
          <AdminDashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateReport={() => setCurrentPage("report-admin")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      case "report-admin":
        return (
          <AdminReport
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("admin")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
      default:
        return (
          <Dashboard
            token={token}
            user={user}
            onLogout={handleLogout}
            onNavigateDashboard={() => setCurrentPage("dashboard")}
            onNavigateReport={() => setCurrentPage("report-user")}
            onNavigateTrash={() => setCurrentPage("trash")}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        );
    }
  };

  return (
    <div className="app-root-container">
      {renderPage()}

      {showProfileModal && (
        <Profile
          token={token}
          user={user}
          onUserUpdate={(updatedUser, newPassword = "") => {
            const mergedUser = { ...user, ...updatedUser };
            if (newPassword) {
              mergedUser.plaintextPassword = newPassword;
            }
            if (updatedUser.avatar) {
              const baseUrl = updatedUser.avatar.split("?")[0];
              mergedUser.avatar = `${baseUrl}?t=${new Date().getTime()}`;
            }
            setUser(mergedUser);
            userService.saveUserProfile(mergedUser);
          }}
          onLogout={handleLogout}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* PWA INSTALL & OFFLINE BANNER */}
      <PWABadge />
    </div>
  );
}
