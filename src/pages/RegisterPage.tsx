import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Toast } from '@/components/ui';
import { User, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, 'You must accept terms of service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data.name, data.email, data.password);
      setToastMessage('Account created successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch {
      setToastMessage('Registration failed. Please try again.');
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
              id="register-toast"
              type="success"
              title="Registration"
              message={toastMessage}
              onDismiss={() => setToastMessage(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 280, damping: 22 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border/80 backdrop-blur-md bg-card/95">
          <CardHeader className="text-center">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring' as const, stiffness: 400 }}
              className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3 shadow-inner cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>

            <CardTitle className="text-2xl font-bold font-heading">Join GourmetAI Discovery</CardTitle>
            <CardDescription>Create your account for personalized GIS dining recommendations</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Anand Raj"
                leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
                error={errors.name?.message}
                {...register('name')}
              />

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

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary"
                    {...register('agreeTerms')}
                  />
                  I agree to the Terms of Service & Privacy Policy
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-destructive font-medium">{errors.agreeTerms.message}</p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-base mt-2 shadow-md shadow-primary/20"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

