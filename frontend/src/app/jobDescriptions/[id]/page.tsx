'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { JobDescription, MatchScore } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiPost } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function JobDescriptionDetailPage() {
  const ready = useRequireAuth();
  const params = useParams();
  const id = params.id;
  
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [match, setMatch] = useState<MatchScore | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    apiGet(`/job-descriptions/${id}/`).then(setJd).catch((err) => setError(err.message));
    apiGet(`/job-descriptions/${id}/match_score/`)
      .then((data) => { if (data.overall_score !== undefined) setMatch(data); })
      .catch(() => {}); // 202 while JD is still being parsed — ignore, next poll will catch it
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const resume = await apiPost('/resumes/', { title: `${jd?.role_title} Resume`, job_description: jd?.id });
      await apiPost(`/resumes/${resume.id}/generate/`, {});
      router.push(`/resumes/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
    const interval = setInterval(load, 3000); // poll while parsing is pending
    return () => clearInterval(interval);
  }, [ready, load]);

  if (!ready || !jd) return null;

  const req = jd.parsed_requirements;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{jd.role_title}</h1>
      <p className="text-gray-500 mb-6">{jd.company}</p>

      {error && <p className="text-red-500">{error}</p>}

      {!req && <p className="text-gray-400">Analyzing job description...</p>}

      {req && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Parsed Requirements</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium mb-1">Required Skills</p>
              <div className="flex gap-1 flex-wrap">
                {(req.required_skills || []).map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Preferred Skills</p>
              <div className="flex gap-1 flex-wrap">
                {(req.preferred_skills || []).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </div>
            <p className="text-sm text-gray-600">Seniority: {req.seniority} · Role type: {req.role_type}</p>
          </CardContent>
        </Card>
      )}

      {match && (
        
        <Card>
          <CardHeader><CardTitle>Match Score: {match.overall_score}%</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {match.missing_required.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1 text-red-600">Missing Required Skills</p>
                <div className="flex gap-1 flex-wrap">
                  {match.missing_required.map((s) => <Badge key={s} variant="destructive">{s}</Badge>)}
                </div>
              </div>
            )}
            {match.missing_preferred.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1 text-yellow-600">Missing Preferred Skills</p>
                <div className="flex gap-1 flex-wrap">
                  {match.missing_preferred.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {match && (
        <div className="mt-6">
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Starting...' : 'Generate Tailored Resume'}
          </Button>
        </div>
      )}
    </div>
  );
}