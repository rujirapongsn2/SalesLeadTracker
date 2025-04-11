import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Users from "@/pages/Users";
import Login from "@/pages/Login";
import ApiManagement from "@/pages/ApiManagement";
import ApiDocumentation from "@/pages/ApiDocumentation";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  const { currentUser } = useAuth();
  const [location] = useLocation();
  
  // Redirect to login if not authenticated and not already on login page
  if (!currentUser && location !== "/login") {
    return <Route path="*" component={Login} />;
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} requiredRoles={["Administrator", "Sales Manager", "Sales Representative"]} />} />
      <Route path="/leads" component={() => <ProtectedRoute component={Leads} requiredRoles={["Administrator", "Sales Manager", "Sales Representative"]} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} requiredRoles={["Administrator", "Sales Manager"]} />} />
      <Route path="/api-management" component={() => <ProtectedRoute component={ApiManagement} requiredRoles={["Administrator"]} />} />
      <Route path="/api-documentation" component={() => <ProtectedRoute component={ApiDocumentation} requiredRoles={["Administrator"]} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout>
            <Router />
          </MainLayout>
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
