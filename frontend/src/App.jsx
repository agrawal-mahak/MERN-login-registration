import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useState, useEffect, useRef, useCallback } from "react";
import  { Toaster } from "react-hot-toast";
import { getCurrentUser } from "./api/userApi";

function AppContent() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const hasShownToastRef = useRef(false);
  const lastPathRef = useRef('');
  const profileModalHandlersRef = useRef({});

  const handleProfileAvatarClick = useCallback(() => {
    profileModalHandlersRef.current?.open?.();
  }, []);

  const handleRegisterProfileHandlers = useCallback((handlers) => {
    profileModalHandlersRef.current = handlers || {};
  }, []);

  useEffect(() => {
    const fetchUser = async() => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await getCurrentUser(token)
          setUser(data)
          
          // Show toast when navigating to home page after login
          const currentPath = location.pathname;
          
          // Reset the flag when path changes to allow showing toast again
          if (lastPathRef.current !== currentPath) {
            hasShownToastRef.current = false;
            lastPathRef.current = currentPath;
            
            // Show toast once when on home page and user is fetched (after navigation)
            if (currentPath === '/' && data) {
              // Use setTimeout to prevent double toast in StrictMode
              setTimeout(() => {
                if (!hasShownToastRef.current) {
                  // toast.success("Login successful");
                  hasShownToastRef.current = true;
                }
              }, 100);
            }
          }

        } catch (error) {
          setError(error.response?.data?.message||"An error occurred")
          localStorage.removeItem("token")
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }
    
    fetchUser();
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  console.log(user, 'hello boyy ------------');
  console.log(error);

  return (
    <>
      <Toaster />
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfileAvatarClick={handleProfileAvatarClick}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              user={user}
              onUserUpdated={setUser}
              onProfileHandlersReady={handleRegisterProfileHandlers}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
