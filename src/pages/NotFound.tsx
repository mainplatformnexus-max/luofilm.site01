import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center p-8">
        <img 
          src="https://i.postimg.cc/T2khf7dN/purple-pink-color-triangle-logo-1273375-228-removebg-preview.png" 
          alt="Luo Film Logo" 
          className="w-24 h-24 mx-auto mb-6 object-contain"
        />
        <h1 className="mb-4 text-6xl font-black gradient-primary-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground font-medium">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 rounded-xl gradient-primary text-primary-foreground font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
