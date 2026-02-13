import { useState, useEffect } from "react";
import { 
  LogIn, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  ArrowRight,
  StepForward,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const steps = [
  {
    id: "login",
    title: "Login",
    description: "Enter your credentials to access your account.",
    icon: LogIn,
    content: (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-secondary/50 p-6 rounded-lg border border-border space-y-3">
          <div className="h-10 bg-background rounded border border-border flex items-center px-3 text-muted-foreground text-sm">email@example.com</div>
          <div className="h-10 bg-background rounded border border-border flex items-center px-3 text-muted-foreground text-sm">••••••••</div>
          <Button className="w-full gradient-primary">Sign In</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> New users can register for an account first.
        </p>
      </div>
    )
  },
  {
    id: "subscribe",
    title: "Subscribe",
    description: "Choose a plan that fits your needs.",
    icon: CreditCard,
    content: (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-secondary/50 p-4 rounded-lg border border-primary/50 relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">POPULAR</div>
            <div className="font-bold">1 Month Normal</div>
            <div className="text-xs text-muted-foreground">UGX 25,000</div>
            <Button size="sm" className="w-full mt-3 h-8 text-xs gradient-primary">Subscribe Now</Button>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg border border-border">
            <div className="font-bold">1 Week Normal</div>
            <div className="text-xs text-muted-foreground">UGX 10,000</div>
            <Button size="sm" variant="outline" className="w-full mt-3 h-8 text-xs">Choose Plan</Button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "download",
    title: "Watch & Download",
    description: "Enjoy your favorite content offline.",
    icon: Download,
    content: (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="aspect-video bg-secondary/50 rounded-lg border border-border relative group overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              <Play className="w-6 h-6 fill-primary" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between">
            <div className="text-[10px] font-medium text-white">Spider-Man: No Way Home</div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs text-emerald-400 font-medium">Download started! 45% complete...</div>
        </div>
      </div>
    )
  }
];

export const UserSimulator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const ActiveStepIcon = steps[currentStep].icon;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ActiveStepIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">User Journey</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Step-by-step simulator</CardDescription>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
            STEP {currentStep + 1}/{steps.length}
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        <div className="space-y-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="py-2">
          {steps[currentStep].content}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between bg-secondary/20 pt-4">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-4 rounded-full transition-colors ${i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-border"}`} 
            />
          ))}
        </div>
        <Button 
          onClick={nextStep} 
          size="sm" 
          className="gap-2 text-xs font-bold"
        >
          {currentStep === steps.length - 1 ? (
            <>Restart <ArrowRight className="w-3 h-3" /></>
          ) : (
            <>Next Step <ChevronRight className="w-3 h-3" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
