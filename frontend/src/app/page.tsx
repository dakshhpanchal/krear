'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { CareerEntry } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CareerBankPage() {
  const ready = useRequireAuth();
  const [entries, setEntries] = useState<CareerEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    apiGet('/career-entries/')
      .then((data) => setEntries(data.results))
      .catch((err) => setError(err.message));
  }, [ready]);

  if (!ready) return null;

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await apiDelete(`/career-entries/${id}/`);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Career Bank</h1>
        <div className="flex gap-2">
          <Link href="/skills"><Button variant="outline">Skills</Button></Link>
          <Link href="/jobDescriptions"><Button variant="outline">Job Descriptions</Button></Link>
          <Link href="/careerEntries/new"><Button>Add Entry</Button></Link>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {entry.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Link href={`/careerEntries/${entry.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
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