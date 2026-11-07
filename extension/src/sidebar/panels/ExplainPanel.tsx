import React, { useState } from 'react';
import { authenticatedFetch } from '../../shared/utils/auth';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = 'https://edupilot-ai-backend-zrka.onrender.com/api/ai';

const ExplainPanel: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const explainTopic = async () => {
    const trimmedTopic = topic.trim();

    if (!trimmedTopic) {
      setError('Enter a topic or paste some text to explain.');
      return;
    }

    setLoading(true);
    setError('');
    setExplanation('');

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: trimmedTopic,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not explain this topic.');
      }

      setExplanation(data.explanation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while generating the explanation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Explain a Topic</h2>
        <p className="text-sm text-gray-500 mt-1">
          Understand difficult concepts in simple language.
        </p>
      </div>

      <textarea
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Enter a topic or paste a difficult paragraph..."
        className="w-full min-h-32 rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={10000}
      />

      <button
        type="button"
        onClick={explainTopic}
        disabled={loading || !topic.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating explanation...' : 'Explain This'}
      </button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

     {explanation && (
  <section className="rounded-lg border border-gray-200 p-4">
    <h3 className="font-semibold mb-2">Explanation</h3>
    <div className="text-sm leading-6">
      <ReactMarkdown>
        {explanation}
      </ReactMarkdown>
    </div>
  </section>
)}
    </div>
  );
};

export default ExplainPanel;