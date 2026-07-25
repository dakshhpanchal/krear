'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPatch } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';

const PROFICIENCIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function EditSkillPage() {
  const ready = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    apiGet(`/skills/${id}/`).then((s) => {
      setName(s.name);
      setCategory(s.category);
      setProficiency(s.proficiency);
      setLoaded(true);
    }).catch((err) => setError(err.message));
  }, [ready, id]);

  if (!ready || !loaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiPatch(`/skills/${id}/`, { name, category, proficiency });
      router.push('/skills');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Skill</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        <Select value={proficiency} onValueChange={setProficiency}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROFICIENCIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}