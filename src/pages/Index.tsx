import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Form Builder SaaS</h1>
        <p className="text-xl text-muted-foreground">Create beautiful forms with drag & drop</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/signup")}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
