"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import {
  addNote,
  deleteAccount,
  deleteNote,
  logOut,
  setNotePinned,
  updateNote,
  type DeleteAccountActionState,
  type NoteActionState,
} from "./actions";
import Brand from "./brand";
import PasswordField from "./password-field";

type Note = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_pinned: boolean;
};

type DashboardProps = {
  notes: Note[];
  userEmail: string;
};

const initialActionState: NoteActionState = { message: "", isError: false };

const noteColors = [
  "border-emerald-200/80 bg-emerald-100/70 hover:border-emerald-300",
  "border-violet-200/80 bg-violet-100/70 hover:border-violet-300",
  "border-orange-200/80 bg-orange-100/70 hover:border-orange-300",
  "border-sky-200/80 bg-sky-100/70 hover:border-sky-300",
  "border-amber-200/80 bg-amber-100/70 hover:border-amber-300",
];

function getNoteColor(noteId: string) {
  let hash = 0;
  for (const character of noteId) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }
  return noteColors[Math.abs(hash) % noteColors.length];
}

function NotePanel({
  note,
  onClose,
  onSaved,
}: {
  note: Note | null;
  onClose: () => void;
  onSaved: (noteId: string) => void;
}) {
  const action = note ? updateNote.bind(null, note.id) : addNote;
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  useEffect(() => {
    if (!state.isError && state.noteId) {
      onSaved(state.noteId);
    }
  }, [onSaved, state.isError, state.noteId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="note-panel-title"
        aria-modal="true"
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/80 bg-[#fbfbff] p-6 shadow-2xl sm:p-9"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {note ? "Your private note" : "A new thought"}
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-tight text-slate-900"
              id="note-panel-title"
            >
              {note ? "Edit note" : "Create a note"}
            </h2>
          </div>
          <button
            aria-label="Close note editor"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Only you can see what you save here.
        </p>
        <form action={formAction} className="mt-8 flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="note-title"
            >
              Title
            </label>
            <input
              autoFocus
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              defaultValue={note?.title}
              id="note-title"
              name="title"
              placeholder="Give this note a name"
              required
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="note-body"
            >
              Your note
            </label>
            <textarea
              className="min-h-64 flex-1 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              defaultValue={note?.body}
              id="note-body"
              name="body"
              placeholder="Write down what you want to remember..."
            />
          </div>
          {state.message && state.isError && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {state.message}
            </p>
          )}
          <div className="mt-auto flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-12 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? "Saving..."
                : note
                  ? "Save changes"
                  : "Save note"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function NoteCard({
  note,
  index,
  isNew,
  onEdit,
  onDelete,
}: {
  note: Note;
  index: number;
  isNew: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pinState, pinFormAction, isPinPending] = useActionState(
    setNotePinned.bind(null, note.id),
    initialActionState,
  );

  return (
    <article
      className={`note-card-enter break-inside-avoid overflow-hidden rounded-[1.5rem] border p-5 shadow-[0_12px_42px_-32px_rgba(54,65,112,0.5)] transition duration-200 hover:shadow-[0_20px_48px_-30px_rgba(54,65,112,0.45)] sm:p-6 ${getNoteColor(note.id)} ${isNew ? "note-card-pop" : ""}`}
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      <button
        aria-label={`Edit ${note.title}`}
        className="block w-full text-left"
        onClick={onEdit}
        type="button"
      >
        <h3 className="break-words text-lg font-bold leading-snug text-slate-900">
          {note.title}
        </h3>
        <p className="mt-2 text-xs font-medium text-slate-500">
          {new Date(note.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="mt-4 line-clamp-6 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
          {note.body}
        </p>
      </button>
      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-900/10 pt-3">
        <form action={pinFormAction}>
          <input
            name="pinned"
            type="hidden"
            value={note.is_pinned ? "false" : "true"}
          />
          <button
            aria-label={`${note.is_pinned ? "Unpin" : "Pin"} ${note.title}`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-60 ${
              note.is_pinned
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "text-slate-500 hover:bg-amber-50 hover:text-amber-700"
            }`}
            disabled={isPinPending}
            title={note.is_pinned ? "Unpin note" : "Pin note"}
            type="submit"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 9V4l1-1V2H7v1l1 1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3Z" />
            </svg>
          </button>
        </form>
        <button
          aria-label={`Edit ${note.title}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/70 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onEdit}
          title="Edit note"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
        <button
          aria-label={`Delete ${note.title}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          onClick={onDelete}
          title="Delete note"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
      {pinState.message && pinState.isError && (
        <p className="mt-2 text-right text-xs text-rose-700" role="alert">
          {pinState.message}
        </p>
      )}
    </article>
  );
}

function DeleteNotePanel({
  note,
  onClose,
}: {
  note: Note;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteNote.bind(null, note.id),
    initialActionState,
  );

  useEffect(() => {
    if (state.message && !state.isError) onClose();
  }, [onClose, state.isError, state.message]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        aria-labelledby="delete-note-title"
        aria-modal="true"
        className="w-full max-w-md rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <h2
          className="text-xl font-bold tracking-tight text-slate-900"
          id="delete-note-title"
        >
          Please confirm you want to delete
        </h2>
        <p className="mt-3 break-words text-sm leading-6 text-slate-600">
          Delete <strong>{note.title}</strong>? This action cannot be undone.
        </p>
        <form action={formAction} className="mt-6">
          <input name="confirmation" type="hidden" value="DELETE" />
          {state.message && state.isError && (
            <p
              className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {state.message}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Deleting..." : "Confirm"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AccountDeletePanel({
  userEmail,
  onClose,
}: {
  userEmail: string;
  onClose: () => void;
}) {
  const initialState: DeleteAccountActionState = { message: "", isError: false };
  const [state, formAction, isPending] = useActionState(
    deleteAccount,
    initialState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="delete-account-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-[1.75rem] border border-rose-100 bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2
              className="text-xl font-bold tracking-tight text-slate-900"
              id="delete-account-title"
            >
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This permanently deletes <strong>{userEmail}</strong> and all of
              its notes. This can&apos;t be undone.
            </p>
          </div>
          <button
            aria-label="Close account deletion dialog"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
        <form action={formAction} className="mt-7 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="delete-confirmation"
            >
              Type <span className="font-bold text-rose-700">DELETE</span> to
              confirm
            </label>
            <input
              autoComplete="off"
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              id="delete-confirmation"
              name="confirmation"
              required
            />
          </div>
          <PasswordField
            id="delete-password"
            label="Current password"
            name="password"
            autoComplete="current-password"
          />
          {state.message && (
            <p
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {state.message}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Keep my account
            </button>
            <button
              className="min-h-11 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Deleting account..." : "Permanently delete"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Dashboard({ notes, userEmail }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const pinnedNotes = useMemo(
    () => notes.filter((note) => note.is_pinned),
    [notes],
  );
  const filteredNotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return notes;
    return notes.filter(
      (note) =>
        note.title.toLocaleLowerCase().includes(query) ||
        note.body.toLocaleLowerCase().includes(query),
    );
  }, [notes, search]);

  const handleSaved = useCallback((noteId: string) => {
    setNewNoteId(noteId);
    setIsCreating(false);
    setEditingNote(null);
  }, []);

  const closePanel = useCallback(() => {
    setIsCreating(false);
    setEditingNote(null);
  }, []);

  const closeDeletePanel = useCallback(() => {
    setNoteToDelete(null);
  }, []);

  const initials = userEmail.slice(0, 1).toUpperCase();

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f8fc] text-slate-900">
      <aside className="flex h-full w-[4.5rem] shrink-0 flex-col border-r border-indigo-100/80 bg-white/80 px-2 py-4 backdrop-blur sm:w-64 sm:px-4 sm:py-6">
        <div className="mb-9 flex justify-center sm:justify-start">
          <div className="hidden sm:block">
            <Brand />
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200 sm:hidden">
            N
          </span>
        </div>
        <button
          className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:justify-start"
          onClick={() => setIsCreating(true)}
          title="Create a note"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <span className="hidden sm:inline">New note</span>
        </button>
        <section
          aria-label="Pinned notes"
          className="mt-7 flex min-h-0 flex-1 flex-col"
        >
          <h2 className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
            Pinned
          </h2>
          {pinnedNotes.length === 0 ? (
            <p className="hidden px-3 text-xs leading-5 text-slate-400 sm:block">
              Pin a note to keep it here.
            </p>
          ) : (
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {pinnedNotes.map((note) => (
                <li key={note.id}>
                  <button
                    aria-label={`Open pinned note: ${note.title}`}
                    className="flex min-h-10 w-full items-center justify-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 sm:justify-start"
                    onClick={() => setEditingNote(note)}
                    title={note.title}
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 9V4l1-1V2H7v1l1 1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3Z" />
                    </svg>
                    <span className="hidden min-w-0 truncate sm:inline">
                      {note.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-center gap-3 sm:justify-start">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
              {initials}
            </span>
            <span className="hidden min-w-0 truncate text-xs font-medium text-slate-600 sm:block">
              {userEmail}
            </span>
          </div>
          <form action={logOut}>
            <button
              className="flex min-h-10 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 sm:justify-start"
              title="Sign out"
              type="submit"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10 5H5v14h5m5-4 4-3-4-3m4 3H9"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
          <button
            aria-label="Delete account"
            className="mt-1 flex min-h-10 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-800 sm:justify-start"
            onClick={() => setIsDeletingAccount(true)}
            title="Delete account"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span className="hidden sm:inline">Delete account</span>
          </button>
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex min-h-20 shrink-0 items-center justify-between gap-4 border-b border-indigo-100/70 bg-white/65 px-4 backdrop-blur sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Your private space
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              A little room for what matters.
            </p>
          </div>
          <label className="relative min-w-0 w-full max-w-md">
            <span className="sr-only">Search notes</span>
            <svg
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="10.8"
                cy="10.8"
                r="6.8"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/90 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your notes..."
              type="search"
              value={search}
            />
          </label>
        </header>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
          <div className="mb-4 flex shrink-0 items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Your collection
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {search ? "Search results" : "All notes"}
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"}
            </span>
          </div>
          {filteredNotes.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-indigo-200 bg-white/60 px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <svg
                  aria-hidden="true"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6.5 4.5h8l3 3v12h-11v-15Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M14.5 4.5v3h3M9.5 12h5M9.5 15.5h3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">
                {search ? "No notes found" : "A fresh page"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try another title or phrase."
                  : "Create your first note and it will be waiting here."}
              </p>
              {!search && (
                <button
                  className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  onClick={() => setIsCreating(true)}
                  type="button"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            <div
              aria-label="Notes"
              className="grid min-h-0 flex-1 auto-rows-max grid-cols-1 items-start gap-4 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            >
              {filteredNotes.map((note, index) => (
                <div className="min-w-0" key={note.id}>
                  <NoteCard
                    index={index}
                    isNew={newNoteId === note.id}
                    note={note}
                    onDelete={() => setNoteToDelete(note)}
                    onEdit={() => setEditingNote(note)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {(isCreating || editingNote) && (
        <NotePanel
          key={editingNote?.id ?? "new-note"}
          note={editingNote}
          onClose={closePanel}
          onSaved={handleSaved}
        />
      )}
      {noteToDelete && (
        <DeleteNotePanel
          note={noteToDelete}
          onClose={closeDeletePanel}
        />
      )}
      {isDeletingAccount && (
        <AccountDeletePanel
          userEmail={userEmail}
          onClose={() => setIsDeletingAccount(false)}
        />
      )}
    </main>
  );
}
