import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { authenticatedFetch } from '../../shared/utils/auth';

interface Flashcard {
  question: string;
  answer: string;
}

const FlashcardsPanel: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateFlashcards = async () => {
    setLoading(true);
    setError('');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

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
        'https://edupilot-ai-backend-zrka.onrender.com/api/ai/flashcards',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pageResponse.data.title || 'Untitled webpage',
            text: pageResponse.data.text.slice(0, 20000),
            numberOfCards: 10,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to generate flashcards.');
      }

      if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error(
          'The AI did not return any flashcards. Please try again.'
        );
      }

      const validCards = data.flashcards.filter(
        (card: Flashcard) =>
          typeof card.question === 'string' &&
          card.question.trim().length > 0 &&
          typeof card.answer === 'string' &&
          card.answer.trim().length > 0
      );

      if (validCards.length === 0) {
        throw new Error(
          'The AI returned flashcards in an unexpected format.'
        );
      }

      setCards(validCards);
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

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((index) => (index + 1) % cards.length);
  };

  const previousCard = () => {
    setIsFlipped(false);
    setCurrentIndex((index) => (index - 1 + cards.length) % cards.length);
  };

  const shuffleCards = () => {
    setCards((previous) => {
      const shuffled = [...previous];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    });

    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetFlashcards = () => {
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setError('');
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
          <Layers size={22} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-gray-800 font-semibold text-base">
            Flashcards
          </h2>
          <p className="text-gray-500 text-sm">
            Remember key concepts through active recall.
          </p>
        </div>
      </div>

      {cards.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles size={16} className="text-blue-500" />
            <span>Generate 10 flashcards from the current webpage.</span>
          </div>

          <button
            type="button"
            onClick={generateFlashcards}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 disabled:opacity-50"
          >
            {loading ? 'Generating flashcards...' : 'Generate Flashcards'}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {currentCard && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>

            <span>
              {Math.round(((currentIndex + 1) / cards.length) * 100)}% through
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{
                width: `${((currentIndex + 1) / cards.length) * 100}%`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFlipped((previous) => !previous)}
            className="w-full min-h-64 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow"
            aria-label={isFlipped ? 'Show question' : 'Reveal answer'}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-4">
              {isFlipped ? 'Answer' : 'Question'}
            </span>

            <span className="text-base font-semibold text-gray-800 whitespace-pre-wrap">
              {isFlipped ? currentCard.answer : currentCard.question}
            </span>

            <span className="text-xs text-gray-400 mt-6">
              Click to {isFlipped ? 'see question' : 'reveal answer'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={previousCard}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="button"
              onClick={nextCard}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={shuffleCards}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Shuffle size={15} />
              Shuffle
            </button>

            <button
              type="button"
              onClick={resetFlashcards}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw size={15} />
              Start Over
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FlashcardsPanel;