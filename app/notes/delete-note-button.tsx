"use client";

import { useActionState, useState } from "react";
import { deleteNote, type NoteActionState } from "../actions";

const initialState: NoteActionState = { message: "", isError: false };

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteNote.bind(null, noteId),
    initialState,
  );

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-start">
      <form
        action={formAction}
      >
        {isConfirmingDelete ? (
          <>
            <input name="confirmation" type="hidden" value="DELETE" />
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-sm font-medium text-slate-700">
                Delete this note permanently?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  onClick={() => setIsConfirmingDelete(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="min-h-10 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            className="min-h-10 w-full rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
          >
            Delete
          </button>
        )}
      </form>
      {state.message && state.isError && (
        <p className="text-sm text-rose-700" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
