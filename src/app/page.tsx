'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, Zap, Target, Timer, CheckSquare, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });

  React.useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        if (result?.error) setError('Invalid email or password');
        else router.push('/dashboard');
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const data = await res.json(); setError(data.error || 'Registration failed'); setLoading(false); return; }
        await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        router.push('/dashboard');
      }
    } catch { setError('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Command className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold tracking-tight">FocusBoard</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">Master your productivity with deep focus</h2>
          <p className="text-lg text-muted-foreground">A premium task management and focus timer app designed for deep work enthusiasts.</p>
          <div className="space-y-4 pt-4">
            {[
              { icon: CheckSquare, title: 'Smart Task Management', desc: 'Organize, prioritize, and track tasks with ease' },
              { icon: Timer, title: 'Pomodoro Timer', desc: 'Deep work sessions with customizable intervals' },
              { icon: Target, title: 'Productivity Insights', desc: 'Track your focus hours and streaks' },
              { icon: Zap, title: 'Quick Notes', desc: 'Capture ideas linked to your tasks' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
                <div className="rounded-lg bg-primary/10 p-2"><f.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="font-medium">{f.title}</p><p className="text-sm text-muted-foreground">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Command className="h-4 w-4 text-primary-foreground" /></div>
              <span className="text-xl font-bold">FocusBoard</span>
            </div>
            <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription>{isLogin ? 'Sign in to your account' : 'Start your productivity journey'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" required />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{typeof error === 'string' ? error : 'An error occurred'}</p>}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? 'Please wait...' : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
