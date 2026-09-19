import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-primary font-heading mb-2">404</h1>
      <p className="text-xl font-semibold text-foreground mb-4">Page Not Found</p>
      <p className="text-sm text-muted-foreground mb-6">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
        Return to Home
      </Link>
    </div>
  );
};
