import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Toast } from '@/components/ui';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'anand.engineer@gourmetai.io',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      setToastMessage('Signed in successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch {
      setToastMessage('Failed to sign in. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50"
          >
            <Toast
              id="login-toast"
              type="success"
              title="Authentication"
              message={toastMessage}
              onDismiss={() => setToastMessage(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border/80 backdrop-blur-md bg-card/95">
          <CardHeader className="text-center">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring' as const, stiffness: 400 }}
              className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-inner cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>

            <CardTitle className="text-2xl font-bold font-heading">Welcome Back to GourmetAI</CardTitle>
            <CardDescription>Sign in to access your saved restaurants and AI match preferences</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary"
                    {...register('rememberMe')}
                  />
                  Remember me on this device
                </label>
                <Link to="/forgot-password" className="text-primary font-semibold hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-base mt-2 shadow-md shadow-primary/20"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Account
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create Free Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

