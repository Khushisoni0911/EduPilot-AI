import React, { useState } from 'react';
import { FileText, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

import { authenticatedFetch } from '../../shared/utils/auth';
import ReactMarkdown from 'react-markdown';
interface PageContent {
  title: string;
  url: string;
  text: string;
  wordCount: number;
}

const API_BASE_URL = 'http://localhost:5001/api/ai';

const SummaryPanel: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');

    try {
      // Step 1: Extract the current webpage using the existing content script.
      const pageResponse = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_CONTENT',
      });

      if (!pageResponse?.success || !pageResponse.data) {
        throw new Error(
          pageResponse?.error || 'Could not extract the webpage content.'
        );
      }

      const page = pageResponse.data as PageContent;

      if (!page.text?.trim()) {
        throw new Error('No readable text was found on this webpage.');
      }

      setPageTitle(page.title);
      setWordCount(page.wordCount ?? page.text.trim().split(/\s+/).length);

      // Step 2: Request a summary from the backend.
const response = await authenticatedFetch(`${API_BASE_URL}/summarize`, {        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: page.title,
          url: page.url,
          text: page.text.slice(0, 30000),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error || result?.message || `Request failed (${response.status}).`
        );
      }

      const generatedSummary =
        result?.summary ?? result?.data?.summary;

      if (typeof generatedSummary !== 'string' || !generatedSummary.trim()) {
        throw new Error('The AI service returned an empty summary.');
      }

      // Step 3: Display the generated summary.
      setSummary(generatedSummary.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating the summary.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <FileText size={22} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            AI Page Summary
          </h2>
          <p className="text-xs text-gray-500">
            Understand what you're reading
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={generateSummary}
        disabled={loading}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Generating summary...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {summary ? 'Regenerate summary' : 'Summarize this page'}
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Summary
            </h3>
          </div>

          {pageTitle && (
            <p className="mb-3 text-xs font-medium text-gray-500">
              {pageTitle}
            </p>
          )}

         <div className="break-words text-sm leading-7 text-gray-700">
  <ReactMarkdown
    components={{
      h1: ({ children }) => (
        <h1 className="mb-3 mt-5 text-xl font-bold text-gray-900">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-2 mt-4 text-lg font-semibold text-gray-900">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-4 text-base font-semibold text-gray-900">
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p className="mb-3">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-gray-900">
          {children}
        </strong>
      ),
      ul: ({ children }) => (
        <ul className="mb-3 ml-5 list-disc space-y-1">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-3 ml-5 list-decimal space-y-1">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="pl-1">{children}</li>,
      hr: () => <hr className="my-4 border-gray-200" />,
    }}
  >
    {summary}
  </ReactMarkdown>
</div>

          <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
            Source content: {wordCount.toLocaleString()} words
          </p>
        </section>
      )}

      {!summary && !error && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Sparkles size={28} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            Ready to help you learn
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
            Generate a concise summary of the current webpage, including its
            key ideas and important information.
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;