'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';

const CATEGORIES = [
  'project', 'experience', 'education', 'achievement',
  'certification', 'award', 'leadership', 'publication',
];

export default function NewCareerEntryPage() {
  const ready = useRequireAuth();
  const router = useRouter();

  const [category, setCategory] = useState('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [metrics, setMetrics] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!ready) return null;

  const csv = (s: string) => s.split(',').map(v => v.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiPost('/career-entries/', {
        category,
        title,
        description,
        tech_stack: csv(techStack),
        metrics: csv(metrics),
        tags: csv(tags),
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Career Entry</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <Input placeholder="Tech stack (comma-separated)" value={techStack} onChange={e => setTechStack(e.target.value)} />
        <Input placeholder="Metrics (comma-separated)" value={metrics} onChange={e => setMetrics(e.target.value)} />
        <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</Button>
      </form>
    </div>
  );
}