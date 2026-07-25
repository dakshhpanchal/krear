'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { Skill } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SkillsPage() {
  const ready = useRequireAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiGet('/skills/')
      .then((data) => setSkills(data.results))
      .catch((err) => setError(err.message));
  }, [ready]);

  if (!ready) return null;

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await apiDelete(`/skills/${id}/`);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        <Link href="/skills/new">
          <Button>Add Skill</Button>
        </Link>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardHeader>
              <CardTitle>{skill.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap mb-2">
                {skill.category && <Badge variant="secondary">{skill.category}</Badge>}
                <Badge>{skill.proficiency}</Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/skills/${skill.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}