import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <h2 className="text-3xl font-semibold text-slate-700">Page Not Found</h2>
        <p className="text-lg text-slate-600 max-w-md">
          Sorry, the page you're looking for doesn't exist. Let's get you back to your resume.
        </p>
        <Button 
          onClick={() => navigate('/')} 
          size="lg" 
          className="mt-8"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
