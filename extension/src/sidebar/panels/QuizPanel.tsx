import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RotateCcw } from 'lucide-react';
import { authenticatedFetch } from '../../shared/utils/auth';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuizPanel: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const score = questions.reduce(
    (total, question, index) =>
      total + (answers[index] === question.correctAnswer ? 1 : 0),
    0
  );

  const generateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);

    try {
      const pageResponse = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_CONTENT',
      });

      if (!pageResponse?.success || !pageResponse?.data?.text?.trim()) {
        throw new Error(
          'Could not read this webpage. Open a webpage with readable content and try again.'
        );
      }

const response = await authenticatedFetch(
          'http://localhost:5001/api/ai/quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pageResponse.data.title || 'Untitled webpage',
            text: pageResponse.data.text.slice(0, 20000),
            numberOfQuestions: 5,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to generate the quiz.');
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('The AI did not return any questions. Please try again.');
      }

      const validQuestions = data.questions.filter(
        (question: QuizQuestion) =>
          typeof question.question === 'string' &&
          Array.isArray(question.options) &&
          question.options.length === 4 &&
          Number.isInteger(question.correctAnswer) &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < 4 &&
          typeof question.explanation === 'string'
      );

      if (validQuestions.length === 0) {
        throw new Error('The AI returned questions in an unexpected format. Please try again.');
      }

      setQuestions(validQuestions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
          <HelpCircle size={22} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-gray-800 font-semibold text-base">
            Quiz Generator
          </h2>
          <p className="text-gray-500 text-sm">
            Test your understanding of this webpage.
          </p>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles size={16} className="text-purple-500" />
            <span>Generate 5 multiple-choice questions from this page.</span>
          </div>

          <button
            type="button"
            onClick={generateQuiz}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 disabled:opacity-50"
          >
            {loading ? 'Generating quiz...' : 'Generate Quiz'}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {questions.map((question, index) => (
        <div
          key={`${index}-${question.question}`}
          className="rounded-xl border border-gray-200 p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-gray-800">
            {index + 1}. {question.question}
          </p>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              const correct = question.correctAnswer === optionIndex;

              let optionStyle =
                'border-gray-200 hover:bg-gray-50';

              if (selected && !submitted) {
                optionStyle = 'border-blue-500 bg-blue-50';
              }

              if (submitted && correct) {
                optionStyle = 'border-green-500 bg-green-50';
              } else if (submitted && selected && !correct) {
                optionStyle = 'border-red-500 bg-red-50';
              }

              return (
                <button
                  key={optionIndex}
                  type="button"
                  disabled={submitted}
                  onClick={() =>
                    setAnswers((previous) => ({
                      ...previous,
                      [index]: optionIndex,
                    }))
                  }
                  className={`w-full flex items-start gap-2 text-left text-sm p-3 rounded-lg border ${optionStyle} disabled:cursor-default`}
                >
                  <span className="font-semibold">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  <span className="flex-1">{option}</span>

                  {submitted && correct && (
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  )}

                  {submitted && selected && !correct && (
                    <XCircle size={16} className="text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <strong className="text-gray-800">Explanation:</strong>{' '}
              {question.explanation}
            </div>
          )}
        </div>
      ))}

      {questions.length > 0 && !submitted && (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-3 disabled:opacity-50"
        >
          Submit Answers
        </button>
      )}

      {questions.length > 0 && submitted && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center space-y-2">
          <p className="text-sm text-blue-700 font-medium">Your Score</p>
          <p className="text-3xl font-bold text-blue-800">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-blue-600">
            {score === questions.length
              ? 'Excellent! You got every question right!'
              : 'Review the explanations to strengthen your understanding.'}
          </p>

          <button
            type="button"
            onClick={restartQuiz}
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-medium"
          >
            <RotateCcw size={14} />
            Generate Another Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPanel;