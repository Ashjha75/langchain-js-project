'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { login } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('password', password);
    try {
      await login({ email, password });
      toast.success('Login successful!');
      router.push('/chat');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center w-full md:w-1/2 p-8 bg-background">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Log in to your account</h1>
          <p className="text-muted-foreground mb-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary underline">
              Sign Up
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
            <Button type="submit" className="w-full bg-primary">
              Sign in
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden md:flex w-[90%] auth-bg items-center justify-center p-8">
        <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome to IntelliChat</h2>
            <p className="mb-6">The AI-powered chat interface with advanced features and an intuitive design.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
