"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export type NoteActionState = {
  message: string;
  isError: boolean;
};

function isValidNoteId(noteId: string) {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(noteId);
}

export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to log out: ${error.message}`);
  }

  redirect("/login");
}

export async function addNote(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.trim() === "") {
    return { message: "Please enter a title.", isError: true };
  }

  if (typeof body !== "string") {
    return { message: "Please enter valid note text.", isError: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify your account: ${userError.message}`);
  }

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("notes")
    .insert({ title: title.trim(), body });

  if (error) {
    return { message: `Unable to save note: ${error.message}`, isError: true };
  }

  revalidatePath("/");
  return { message: "Note saved.", isError: false };
}

export async function updateNote(
  noteId: string,
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  if (!isValidNoteId(noteId)) {
    return { message: "Invalid note.", isError: true };
  }

  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.trim() === "") {
    return { message: "Please enter a title.", isError: true };
  }

  if (typeof body !== "string") {
    return { message: "Please enter valid note text.", isError: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify your account: ${userError.message}`);
  }

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("notes")
    .update({
      title: title.trim(),
      body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { message: `Unable to update note: ${error.message}`, isError: true };
  }

  if (!data) {
    return { message: "Note not found.", isError: true };
  }

  revalidatePath("/");
  revalidatePath(`/notes/${noteId}`);
  redirect("/");
}

export async function deleteNote(
  noteId: string,
  _previousState: NoteActionState,
  _formData: FormData,
): Promise<NoteActionState> {
  void _previousState;
  void _formData;

  if (!isValidNoteId(noteId)) {
    return { message: "Unable to delete note.", isError: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify your account: ${userError.message}`);
  }

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { message: `Unable to delete note: ${error.message}`, isError: true };
  }

  if (!data) {
    return { message: "Unable to delete note.", isError: true };
  }

  revalidatePath("/");
  revalidatePath(`/notes/${noteId}`);
  return { message: "Note deleted.", isError: false };
}
