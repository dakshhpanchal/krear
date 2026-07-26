'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { JobDescription } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function JobDescriptionsPage() {
  const ready = useRequireAuth();
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    apiGet('/job-descriptions/')
      .then((data) => setJds(data.results))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  if (!ready) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiPost('/job-descriptions/', {
        company, role_title: roleTitle, raw_text: rawText,
      });
      setCompany(''); setRoleTitle(''); setRawText('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Job Descriptions</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8 border rounded-lg p-4">
        <div className="flex gap-3">
          <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
          <Input placeholder="Role title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} required />
        </div>
        <Textarea
          placeholder="Paste the full job description here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={8}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Analyzing...' : 'Add & Analyze'}</Button>
      </form>

      <div className="flex flex-col gap-4">
        {jds.map((jd) => (
          <Link key={jd.id} href={`/jobDescriptions/${jd.id}`}>
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle>{jd.role_title} — {jd.company}</CardTitle>
              </CardHeader>
              <CardContent>
                {jd.parsed_requirements ? (
                  <div className="flex gap-1 flex-wrap">
                    {(jd.parsed_requirements.required_skills || []).slice(0, 6).map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Parsing pending...</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}