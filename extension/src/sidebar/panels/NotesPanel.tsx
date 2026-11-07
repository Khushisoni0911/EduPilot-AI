
import { useState } from 'react';
import { authenticatedFetch } from '../../shared/utils/auth';

interface NotesResponse {
  success: boolean;
  notes?: {
    title: string;
    summary: string;
    keyPoints: string[];
    keyTerms: {
      term: string;
      definition: string;
    }[];
    revisionTips: string[];
  };
  error?: string;
}

export default function NotesPanel() {
  const [notes, setNotes] = useState<NotesResponse['notes'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNotes = async () => {
    setLoading(true);
    setError('');
    setNotes(null);

    try {
      const pageResponse = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_CONTENT',
      });

      if (!pageResponse?.success || !pageResponse?.data?.text?.trim()) {
        throw new Error(
          'Could not read this webpage. Open a webpage containing readable text and try again.'
        );
      }

      const response = await authenticatedFetch(
        'https://edupilot-ai-backend-zrka.onrender.com/api/ai/notes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pageResponse.data.title || 'Untitled webpage',
            text: pageResponse.data.text.slice(0, 20000),
          }),
        }
      );

      const data: NotesResponse = await response.json();

      if (!response.ok || !data.success || !data.notes) {
        throw new Error(data.error || 'Failed to generate notes.');
      }

      setNotes(data.notes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while generating notes.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = async () => {
    if (!notes) return;

    const text = [
      notes.title,
      '',
      'SUMMARY',
      notes.summary,
      '',
      'KEY POINTS',
      ...notes.keyPoints.map((point) => `• ${point}`),
      '',
      'KEY TERMS',
      ...notes.keyTerms.map(({ term, definition }) => `${term}: ${definition}`),
      '',
      'QUICK REVISION',
      ...notes.revisionTips.map((tip) => `• ${tip}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError('Could not copy the notes. Please try again.');
    }
  };

  return (
    <div className="min-h-full space-y-4 bg-white p-4 text-sm text-slate-800 dark:bg-gray-900 dark:text-slate-100">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Smart Notes
        </h2>

        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Turn any webpage into organized study notes.
        </p>
      </div>

      <button
        type="button"
        onClick={generateNotes}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Generating notes...' : 'Generate Study Notes'}
      </button>

      {loading && (
        <p className="text-center text-slate-500 dark:text-slate-400">
          EduPilot AI is organizing the webpage content into study notes.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {notes && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words text-lg font-semibold text-slate-900 dark:text-white">
              {notes.title}
            </h3>

            <button
              type="button"
              onClick={copyNotes}
              className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Copy Notes
            </button>
          </div>

          <section>
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Summary
            </h4>
            <p className="break-words leading-6 text-slate-700 dark:text-slate-300">
              {notes.summary}
            </p>
          </section>

          <section>
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Key Points
            </h4>
            <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
              {notes.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Important Terms
            </h4>

            <div className="space-y-3">
              {notes.keyTerms.map(({ term, definition }, index) => (
                <div
                  key={`${term}-${index}`}
                  className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800"
                >
                  <p className="font-medium text-slate-900 dark:text-white">
                    {term}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {definition}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Quick Revision
            </h4>
            <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
              {notes.revisionTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
