import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/SignupPage";
import VolunteerDashboard from "@/pages/VolunteerDashboard";
import ReporterDashboard from "@/pages/ReporterDashboard";
import NgoDashboard from "@/pages/NgoDashboard";
import DonorDashboard from "@/pages/DonorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Footer from "@/components/Footer";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/dashboard" component={VolunteerDashboard} />
      <Route path="/reporter-dashboard" component={ReporterDashboard} />
      <Route path="/ngo-dashboard" component={NgoDashboard} />
      <Route path="/donor-dashboard" component={DonorDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route component={LoginPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col">
              <Router />
            </div>
            <Footer />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
