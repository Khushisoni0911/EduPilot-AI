import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  FilePlus2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import type { Note } from '../../shared/types/notes';
import {
  deleteNote,
  getAllNotes,
  saveNote,
} from '../../shared/utils/notes-storage';
import { sendToBackground } from '../../shared/utils/messaging';
import type { TabInfo } from '../../shared/types/types';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [sourceUrl, setSourceUrl] = useState('');
const [sourceTitle, setSourceTitle] = useState('');
const [isAttachingPage, setIsAttachingPage] = useState(false);

const handleAttachCurrentPage = async () => {
  setIsAttachingPage(true);
  setError('');
  setNotice('');

  try {
    const response = await sendToBackground<undefined, TabInfo>(
      'GET_ACTIVE_TAB_INFO'
    );

    if (!response.success || !response.data?.url) {
      setError('Could not retrieve the current webpage.');
      return;
    }

    setSourceUrl(response.data.url);
    setSourceTitle(response.data.title || response.data.url);
    setNotice('Current webpage attached to your note.');
  } catch {
    setError('Could not retrieve the current webpage. Please try again.');
  } finally {
    setIsAttachingPage(false);
  }
};

  useEffect(() => {
    let isMounted = true;

    getAllNotes()
      .then((savedNotes) => {
        if (isMounted) setNotes(savedNotes);
      })
      .catch(() => {
        if (isMounted) {
          setError('Could not load notes. Please reload the extension.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.sourceTitle?.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const startNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setSourceUrl('');
    setError('');
    setNotice('');
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSourceUrl(note.sourceUrl ?? '');
    setError('');
    setNotice('');
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() && !content.trim()) {
      setError('Add a title or some content before saving.');
      return;
    }

    const now = Date.now();

   const note: Note = {
     id: selectedNote?.id ?? crypto.randomUUID(),
     title: title.trim() || 'Untitled note',
  content: content.trim(),
  sourceUrl: sourceUrl || undefined,
  sourceTitle: sourceTitle || undefined,
  createdAt: selectedNote?.createdAt ?? now,
  updatedAt: now,
};

    try {
      await saveNote(note);
      const updatedNotes = await getAllNotes();

      setNotes(updatedNotes);
      setSelectedNote(note);
      setNotice('Note saved successfully.');
      setError('');
    } catch {
      setError('Could not save your note. Please try again.');
    }
  };

  const handleDelete = async (note: Note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;

    try {
      await deleteNote(note.id);
      setNotes(await getAllNotes());

      if (selectedNote?.id === note.id) {
        startNewNote();
      }

      setNotice('Note deleted.');
      setError('');
    } catch {
      setError('Could not delete the note. Please try again.');
    }
  };

  const handleCopy = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(
        `${note.title}\n\n${note.content}`
      );
      setNotice('Note copied to clipboard.');
      setError('');
    } catch {
      setError('Could not copy the note. Check clipboard permissions.');
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
        Loading your notes...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 text-gray-800">
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={19} className="text-amber-500" />
            <h2 className="text-base font-semibold">Your Notes</h2>
          </div>

          <button
            type="button"
            onClick={startNewNote}
            aria-label="Create a new note"
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            New note
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3">
          <Search size={15} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your notes..."
            aria-label="Search notes"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {(error || notice) && (
        <div
          role={error ? 'alert' : 'status'}
          className={`mx-4 mt-3 rounded-lg px-3 py-2 text-xs ${
            error
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-4">
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4"
        >
        <div className="flex items-center justify-between">
  <h3 className="text-sm font-semibold">
    {selectedNote ? 'Edit note' : 'Create a note'}
  </h3>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={handleAttachCurrentPage}
      disabled={isAttachingPage}
      className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
    >
      {isAttachingPage ? 'Attaching...' : 'Attach Current Page'}
    </button>

    {selectedNote && (
      <button
        type="button"
        onClick={startNewNote}
        className="text-xs text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={14} className="mr-1 inline" />
        New
      </button>
    )}
  </div>
</div><div className="flex items-center justify-between">
  <h3 className="text-sm font-semibold">
    {selectedNote ? 'Edit note' : 'Create a note'}
  </h3>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={handleAttachCurrentPage}
      disabled={isAttachingPage}
      className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
    >
      {isAttachingPage ? 'Attaching...' : 'Attach Current Page'}
    </button>

    {selectedNote && (
      <button
        type="button"
        onClick={startNewNote}
        className="text-xs text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={14} className="mr-1 inline" />
        New
      </button>
    )}
  </div>
</div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            aria-label="Note title"
            maxLength={200}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your notes here..."
            aria-label="Note content"
            rows={5}
            maxLength={50000}
            className="min-h-28 resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-blue-400"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <FilePlus2 size={15} />
            {selectedNote ? 'Save changes' : 'Save note'}
          </button>
        </form>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Saved notes ({filteredNotes.length})
            </h3>
            {searchQuery && (
              <span className="text-xs text-gray-500">
                Filtered results
              </span>
            )}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
              <BookOpen
                size={25}
                className="mx-auto mb-3 text-gray-400"
              />
              <p className="text-sm font-medium text-gray-700">
                {searchQuery ? 'No matching notes' : 'No notes yet'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {searchQuery
                  ? 'Try another search term.'
                  : 'Create your first note above. Your notes will be saved in Chrome.'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <article
                key={note.id}
                className={`rounded-xl border bg-white p-3 ${
                  selectedNote?.id === note.id
                    ? 'border-blue-300 ring-1 ring-blue-100'
                    : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => startEditing(note)}
                  className="block w-full text-left"
                >
                  <h4 className="break-words text-sm font-semibold">
                    {note.title}
                  </h4>

                  <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600">
                    {note.content.length > 180
                      ? `${note.content.slice(0, 180)}…`
                      : note.content || 'No content'}
                  </p>
                </button>

                {note.sourceTitle && (
                  <p className="mt-2 truncate text-xs text-blue-600">
                    Source: {note.sourceTitle}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-[10px] text-gray-400">
                    Updated {formatDate(note.updatedAt)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(note)}
                      aria-label={`Edit ${note.title}`}
                      title="Edit note"
                      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCopy(note)}
                      aria-label={`Copy ${note.title}`}
                      title="Copy note"
                      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(note)}
                      aria-label={`Delete ${note.title}`}
                      title="Delete note"
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;