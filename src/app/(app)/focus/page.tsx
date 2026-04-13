'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Timer, Coffee, Zap, History } from 'lucide-react';

interface FocusSession {
  id: string;
  duration: number;
  type: string;
  completed: boolean;
  startedAt: string;
}

export default function FocusPage() {
  const [focusDuration, setFocusDuration] = React.useState(25);
  const [breakDuration, setBreakDuration] = React.useState(5);
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isBreak, setIsBreak] = React.useState(false);
  const [sessions, setSessions] = React.useState<FocusSession[]>([]);
  const [totalFocus, setTotalFocus] = React.useState(0);

  const totalTime = (isBreak ? breakDuration : focusDuration) * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  React.useEffect(() => {
    fetch('/api/focus').then(r => r.json()).then(data => {
      setSessions(data);
      const today = new Date().toDateString();
      setTotalFocus(data.filter((s: FocusSession) => new Date(s.startedAt).toDateString() === today && s.completed).reduce((a: number, s: FocusSession) => a + s.duration, 0));
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            saveSession(focusDuration);
            setIsBreak(true);
            return breakDuration * 60;
          } else {
            setIsBreak(false);
            return focusDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, focusDuration, breakDuration]);

  const saveSession = async (duration: number) => {
    try {
      const res = await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, type: 'focus', completed: true }),
      });
      const session = await res.json();
      setSessions(prev => [session, ...prev]);
      setTotalFocus(prev => prev + duration);
    } catch { /* ignore */ }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusDuration * 60);
  };

  const selectDuration = (min: number) => {
    setFocusDuration(min);
    if (!isRunning && !isBreak) setTimeLeft(min * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground mt-1">Deep work sessions with Pomodoro technique</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col items-center">
          <Card className="w-full max-w-lg">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="mb-6 flex items-center gap-2">
                <Badge variant={isBreak ? 'secondary' : 'default'} className="text-sm">
                  {isBreak ? <><Coffee className="h-3 w-3 mr-1" /> Break</> : <><Zap className="h-3 w-3 mr-1" /> Focus</>}
                </Badge>
              </div>

              <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="2" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
                    className="text-primary transition-all duration-1000" strokeWidth="2" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  />
                </svg>
                <div className="text-center">
                  <span className="text-6xl font-bold tabular-nums tracking-tight">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">{isBreak ? 'Take a break' : 'Stay focused'}</p>
                </div>
              </div>

              <Progress value={progress} className="w-full mb-8 h-2" />

              <div className="flex items-center gap-4">
                <Button size="lg" onClick={toggleTimer} className="w-32 gap-2 text-base">
                  {isRunning ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Start</>}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 mt-6">
            {[15, 25, 30, 45, 60].map(d => (
              <Button key={d} variant={focusDuration === d ? 'default' : 'outline'} size="sm" onClick={() => selectDuration(d)}>
                {d}m
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalFocus}<span className="text-lg font-normal text-muted-foreground"> min</span></div>
              <p className="text-sm text-muted-foreground">{Math.round(totalFocus / 60 * 10) / 10} hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sessions yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sessions.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{s.duration} min focus</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Break Duration</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              {[3, 5, 10, 15].map(d => (
                <Button key={d} variant={breakDuration === d ? 'default' : 'outline'} size="sm" onClick={() => { setBreakDuration(d); if (isBreak && !isRunning) setTimeLeft(d * 60); }}>
                  {d}m
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
