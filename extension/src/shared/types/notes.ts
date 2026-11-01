export interface Note {
  id: string;
  title: string;
  content: string;
  sourceUrl?: string;
  sourceTitle?: string;
  createdAt: number;
  updatedAt: number;
}

export const NOTES_STORAGE_KEY = 'edupilot_notes';