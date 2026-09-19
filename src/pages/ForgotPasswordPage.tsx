import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@/services/auth.service';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Toast } from '@/components/ui';
import { Mail, KeyRound, ArrowLeft, Lock } from 'lucide-react';


const forgotSchema = z.object({
  email: z.string().email('Please enter a valid registered email address'),
});

const resetSchema = z.object({
  token: z.string().min(10, 'Please enter the recovery token received in email'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    setValue: setResetValue,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setResetValue('token', tokenFromUrl);
      setStep('reset');
      setToastMessage('Recovery token verified from email link! Please set your new password.');
    }
  }, [tokenFromUrl, setResetValue]);


  const onRequestSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    try {
      const res = await AuthService.forgotPassword(data.email);
      setToastMessage(res.message);
      setStep('reset');
    } catch {
      setToastMessage('Unable to send password recovery email.');
    } finally {
      setIsLoading(false);
    }
  };


  const onResetSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    try {
      await AuthService.resetPassword(data.token, data.newPassword);
      setToastMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch {
      setToastMessage('Invalid or expired reset token.');
    } finally {
      setIsLoading(false);
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
              id="forgot-toast"
              type="info"
              title="Password Recovery"
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
              className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner cursor-pointer"
            >
              <KeyRound className="w-6 h-6" />
            </motion.div>
            <CardTitle className="text-2xl font-bold font-heading">
              {step === 'request' ? 'Reset Account Password' : 'Set New Password'}
            </CardTitle>
            <CardDescription>
              {step === 'request'
                ? 'Enter your registered email address to receive a secure recovery link'
                : 'Choose a strong new password for your account'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'request' ? (
              <form onSubmit={handleForgotSubmit(onRequestSubmit)} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  error={forgotErrors.email?.message}
                  {...registerForgot('email')}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-base mt-2 shadow-md shadow-primary/20"
                    isLoading={isLoading}
                  >
                    Send Recovery Link
                  </Button>
                </motion.div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                {/* Hidden token field */}
                <input type="hidden" {...registerReset('token')} />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  error={resetErrors.newPassword?.message}
                  {...registerReset('newPassword')}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  error={resetErrors.confirmPassword?.message}
                  {...registerReset('confirmPassword')}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-base mt-2 shadow-md shadow-primary/20"
                    isLoading={isLoading}
                  >
                    Update Password
                  </Button>
                </motion.div>
              </form>
            )}

          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs text-primary font-bold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

