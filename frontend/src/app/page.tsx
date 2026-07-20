'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Career Bank</h1>
        <Link href="/careerEntries/new">
          <Button>Add Entry</Button>
        </Link>
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
              <div className="flex gap-1 flex-wrap">
                {entry.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}