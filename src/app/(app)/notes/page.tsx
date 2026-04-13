'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, StickyNote, Save } from 'lucide-react';

interface Note { id: string; content: string; taskId: string | null; updatedAt: string; }
interface Task { id: string; title: string; }

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    Promise.all([fetch('/api/notes').then(r => r.json()), fetch('/api/tasks').then(r => r.json())])
      .then(([n, t]) => { setNotes(n); setTasks(t); if (n.length > 0) setSelectedNote(n[0]); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createNote = async () => {
    const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: '' }) });
    const note = await res.json();
    setNotes(prev => [note, ...prev]);
    setSelectedNote(note);
  };

  const updateNote = (content: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, content };
    setSelectedNote(updated);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));

    if (saveTimeout) clearTimeout(saveTimeout);
    const t = setTimeout(async () => {
      await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
      });
    }, 500);
    setSaveTimeout(t);
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (selectedNote?.id === id) setSelectedNote(updated[0] || null);
  };

  const linkTask = async (taskId: string) => {
    if (!selectedNote) return;
    await fetch(`/api/notes/${selectedNote.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: selectedNote.content, taskId })
    });
    const updated = { ...selectedNote, taskId };
    setSelectedNote(updated);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-32 animate-pulse bg-muted rounded" /></CardContent></Card>)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Quick notes linked to your tasks</p>
        </div>
        <Button onClick={createNote} className="gap-2"><Plus className="h-4 w-4" />New Note</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">All Notes ({notes.length})</h3>
          {notes.length === 0 ? (
            <Card><CardContent className="py-8 text-center"><StickyNote className="h-8 w-8 mx-auto text-muted-foreground/50" /><p className="text-sm text-muted-foreground mt-2">No notes yet</p></CardContent></Card>
          ) : notes.map(note => (
            <Card key={note.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedNote(note)}>
              <CardContent className="p-4">
                <p className="text-sm truncate">{note.content || 'Empty note'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.taskId && <Badge variant="outline" className="text-[10px]">Linked</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedNote ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Save className="h-4 w-4 text-muted-foreground" />Autosaved</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedNote.taskId || 'none'} onValueChange={linkTask}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Link to task..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No task</SelectItem>
                      {tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote(selectedNote.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={selectedNote.content} onChange={e => updateNote(e.target.value)} placeholder="Start typing..." className="min-h-[400px] text-base leading-relaxed resize-y" />
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-16 text-center"><StickyNote className="h-12 w-12 mx-auto text-muted-foreground/30" /><p className="mt-4 text-lg font-medium">Select a note</p><p className="text-sm text-muted-foreground">Choose from the sidebar or create a new one</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ className, variant, children }: { className?: string; variant?: string; children: React.ReactNode }) {
  const cls = {
    outline: 'border px-2 py-0.5 rounded-full text-xs',
  }[variant || 'outline'] || 'border px-2 py-0.5 rounded-full text-xs';
  return <span className={`${cls} ${className || ''}`}>{children}</span>;
}
