import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import CourseViewer from "@/pages/CourseViewer";
import SkillTest from "@/pages/SkillTest";
import AdminDashboard from "@/pages/AdminDashboard";
import Profile from "@/pages/Profile";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Landing from "@/pages/Landing";
import PaymentSuccess from "@/pages/PaymentSuccess";
import CareerResult from "@/pages/CareerResult";
import PublicResult from "@/pages/PublicResult";
import NotFound from "@/pages/not-found";

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923124494267?text=Hi%20Byonsoft%20Support,%20I%20need%20help!"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="button-whatsapp"
      style={{ zIndex: 9999 }}
      className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/40 hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-200"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.47.644 4.887 1.87 7.01L2 30l7.19-1.888A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.538a11.51 11.51 0 0 1-5.88-1.612l-.42-.25-4.27 1.12 1.14-4.15-.274-.428A11.503 11.503 0 0 1 4.46 16.003c0-6.367 5.178-11.544 11.543-11.544 6.366 0 11.543 5.177 11.543 11.544 0 6.366-5.177 11.535-11.543 11.535zm6.326-8.642c-.347-.174-2.054-1.015-2.374-1.13-.318-.116-.55-.174-.78.174-.23.347-.895 1.13-1.098 1.362-.202.23-.405.26-.752.087-.347-.174-1.466-.54-2.793-1.724-1.033-.92-1.73-2.057-1.932-2.404-.203-.347-.022-.535.152-.708.158-.155.347-.405.52-.607.174-.202.232-.347.347-.578.116-.232.058-.434-.029-.607-.087-.174-.78-1.88-1.07-2.575-.28-.676-.566-.584-.78-.595l-.664-.01c-.23 0-.607.086-.924.434-.318.347-1.214 1.187-1.214 2.893 0 1.707 1.243 3.356 1.416 3.588.174.232 2.446 3.732 5.927 5.235.828.357 1.474.57 1.978.73.83.264 1.587.227 2.183.137.666-.1 2.054-.84 2.345-1.652.29-.81.29-1.506.203-1.652-.086-.145-.318-.23-.665-.404z"/>
      </svg>
    </a>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading, userRef } = useAuth();
  const [location, setLocation] = useLocation();

  const effectiveUser = user || userRef.current;

  useEffect(() => {
    if (!isLoading && !effectiveUser && location !== "/login") {
      setLocation("/login");
    }
    if (!isLoading && effectiveUser && adminOnly && effectiveUser.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [isLoading, effectiveUser, location, adminOnly]);

  if (isLoading && !effectiveUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!effectiveUser) return null;
  if (adminOnly && effectiveUser.role !== "admin") return null;

  return <Component />;
}


function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/register" component={Signup} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/course/:id">
        <ProtectedRoute component={CourseViewer} />
      </Route>
      <Route path="/skill-test">
        <ProtectedRoute component={SkillTest} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/success" component={PaymentSuccess} />
      <Route path="/career-result">
        <ProtectedRoute component={CareerResult} />
      </Route>
      <Route path="/result/:shareId" component={PublicResult} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
          <WhatsAppButton />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
