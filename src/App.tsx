import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Builder from "./pages/Builder";
import PublicForm from "./pages/PublicForm";
import FormWebhooks from "./pages/FormWebhooks";
import Gallery from "./pages/Gallery";
import GalleryItem from "./pages/GalleryItem";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FormResponses from "./pages/FormResponses";
import Submissions from "./pages/Submissions";
import SubmissionDetails from "./pages/SubmissionDetails";
import FormAnalytics from "./pages/FormAnalytics";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/forms/:formId/responses" element={<FormResponses />} />
              <Route path="/dashboard/forms/:formId/submissions" element={<Submissions />} />
              <Route path="/dashboard/forms/:formId/submissions/:submissionId" element={<SubmissionDetails />} />
              <Route path="/dashboard/forms/:formId/analytics" element={<FormAnalytics />} />
              <Route path="/dashboard/forms/:formId/webhooks" element={<FormWebhooks />} />
              <Route path="/builder/:formId" element={<Builder />} />
            </Route>

            <Route path="/f/:formId" element={<PublicForm />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:id" element={<GalleryItem />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
