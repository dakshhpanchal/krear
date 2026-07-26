'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';
import { ResumeVersion } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AtsScore {
  content_score?: number;
  parseability_score: number;
  overall_score?: number;
  parseability_issues: string[];
  missing_required?: string[];
  missing_preferred?: string[];
  error?: string;
}

export default function ResumeDetailPage() {
  const ready = useRequireAuth();
  const params = useParams();
  const id = params.id;

  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [error, setError] = useState('');

  const [ats, setAts] = useState<AtsScore | null>(null);
  const [checkingAts, setCheckingAts] = useState(false);

  const load = useCallback(() => {
    apiGet(`/resume-versions/?resume=${id}`)
      .then((data) => setVersion(data.results?.[0] ?? data[0] ?? null))
      .catch((err) => setError(err.message));
  }, [id]);

  const checkAts = async () => {
    if (!version) return;
    setCheckingAts(true);
    try {
      const result = await apiGet(`/resume-versions/${version.id}/ats_score/`);
      setAts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ATS score');
    } finally {
      setCheckingAts(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [ready, load]);

  if (!ready) return null;

  const pending = !version || (!version.pdf_file && !version.diff_from_previous?.compile_error);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generated Resume</h1>
      {error && <p className="text-red-500">{error}</p>}

      {pending && <p className="text-gray-400">Generating and compiling resume...</p>}

      {version?.diff_from_previous?.compile_error && (
        <Card>
          <CardHeader><CardTitle className="text-red-600">Compilation Failed</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap text-gray-700">
              {version.diff_from_previous.compile_error}
            </pre>
          </CardContent>
        </Card>
      )}

      {version?.pdf_file && (
  <div className="flex flex-col gap-4">
    <Card>
      <CardHeader><CardTitle>Version {version.version_number}</CardTitle></CardHeader>
      <CardContent className="flex gap-2">
        <a href={version.pdf_file} target="_blank" rel="noopener noreferrer">
          <Button>Open / Download PDF</Button>
        </a>
        <Button variant="outline" onClick={checkAts} disabled={checkingAts}>
          {checkingAts ? 'Checking...' : 'Check ATS Score'}
        </Button>
      </CardContent>
    </Card>

    {ats && (
      <Card>
        <CardHeader>
          <CardTitle>
            ATS Score: {ats.overall_score ?? '—'}
            {ats.overall_score !== undefined && '%'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {ats.error && <p className="text-sm text-yellow-600">{ats.error}</p>}

          <div className="flex gap-4 text-sm">
            {ats.content_score !== undefined && <p>Content match: <strong>{ats.content_score}%</strong></p>}
            <p>Parseability: <strong>{ats.parseability_score}%</strong></p>
          </div>

          {ats.parseability_issues.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1 text-yellow-700">Parseability Issues</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {ats.parseability_issues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}

          {(ats.missing_required?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-medium mb-1 text-red-600">Missing Required Skills</p>
              <div className="flex gap-1 flex-wrap">
                {ats.missing_required!.map((s) => <Badge key={s} variant="destructive">{s}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )}

    <embed
      src={version.pdf_file}
      type="application/pdf"
      className="w-full h-[800px] border rounded-lg"
    />
  </div>
)}
    </div>
  );
}