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
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
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

    // Direct to dashboard or admin only if a valid session exists in local storage
    const savedToken = localStorage.getItem("token");
    const savedUser = userService.getUserProfile();
    if (savedToken && savedUser && savedUser.id_users) {
      if (savedUser.role === "admin") {
        return "admin";
      }
      return "dashboard";
    }

    // Default to Landing Page for all unauthenticated visitors
    return "landing";
  });

  // Clean up URL query parameters on mount if resetToken or verified was present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetToken") || params.get("verified")) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }

    // Refresh user profile from Supabase database if logged in
    const currentProfile = userService.getUserProfile();
    if (currentProfile && currentProfile.id_users) {
      userService.fetchProfile().then((freshProfile) => {
        if (freshProfile) {
          setUser(freshProfile);
        }
      });
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
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
    setUser(null);
    setCurrentPage("landing");
  };

  // State Router
  const renderPage = () => {
    // Route guard: If user attempts to view protected pages without an active session, redirect to landing
    const isAuthenticated = Boolean(token && user && user.id_users);
    const protectedPages = ["dashboard", "admin", "trash", "report-user", "report-admin", "profile"];
    if (protectedPages.includes(currentPage) && !isAuthenticated) {
      return (
        <LandingPage
          onNavigateLogin={() => setCurrentPage("login")}
          onNavigateRegister={() => setCurrentPage("register")}
        />
      );
    }

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
            onNavigateLanding={() => setCurrentPage("landing")}
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
            onNavigateLanding={() => setCurrentPage("landing")}
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
            onNavigateLanding={() => setCurrentPage("landing")}
          />
        );
      case "register":
        return (
          <Register
            onNavigateLogin={() => {
              setVerificationSuccess(false);
              setCurrentPage("login");
            }}
            onNavigateLanding={() => setCurrentPage("landing")}
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
