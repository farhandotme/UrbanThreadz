"use client"
import { useState } from 'react';
import { X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  fullname: z.string().min(3, "Name must be at least 3 characters").max(50, "Name is too long"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, "Password must contain at least one letter and one number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
    },
  });

  if (!isOpen) return null;

  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const onRegisterSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      const response = await axios.post("/api/users/register", {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
      });

      if (response.status === 201) {
        // Auto sign in after registration
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Registration successful!');
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  const renderForm = () => {
    if (isLogin) {
      return (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...loginForm.register("email")}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
            />
            {loginForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              {...loginForm.register("password")}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
            />
            {loginForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-3 font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Sign in
          </button>
        </form>
      );
    } else {
      return (
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              {...registerForm.register("fullname")}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
            />
            {registerForm.formState.errors.fullname && (
              <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.fullname.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...registerForm.register("email")}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
            />
            {registerForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              {...registerForm.register("password")}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
            />
            {registerForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-md py-3 font-medium hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Create account
          </button>
        </form>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
          {/* Left black accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black"></div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-black transition-colors duration-200"
          >
            <X size={20} />
          </button>

          <div className="px-8 pt-8 pb-6">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-black">
                {isLogin ? 'Welcome back' : 'Join us'}
              </h2>
              <p className="text-gray-500 mt-2">
                {isLogin ? 'Sign in to continue to your account' : 'Create your account to get started'}
              </p>
            </div>

            {/* Google Login Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-3 px-4 mb-6 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">or continue with email</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Render the appropriate form based on current auth mode */}
            {renderForm()}
          </div>

          <div className="bg-gray-50 px-8 py-4 text-center">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-black transition-colors"
              onClick={toggleAuthMode}
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}