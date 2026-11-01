import {
  getLocalStorage,
  setLocalStorage,
} from './chrome-storage';

import {
  NOTES_STORAGE_KEY,
  type Note,
} from '../types/notes';

export async function getAllNotes(): Promise<Note[]> {
  const notes = await getLocalStorage<Note[]>(NOTES_STORAGE_KEY);
  return notes ?? [];
}

export async function saveNote(
  note: Note
): Promise<void> {
  const notes = await getAllNotes();

  const existingIndex = notes.findIndex(
    (item) => item.id === note.id
  );

  if (existingIndex >= 0) {
    notes[existingIndex] = {
      ...note,
      updatedAt: Date.now(),
    };
  } else {
    notes.unshift(note);
  }

  await setLocalStorage(NOTES_STORAGE_KEY, notes);
}

export async function deleteNote(
  noteId: string
): Promise<void> {
  const notes = await getAllNotes();

  const updatedNotes = notes.filter(
    (note) => note.id !== noteId
  );

  await setLocalStorage(NOTES_STORAGE_KEY, updatedNotes);
}