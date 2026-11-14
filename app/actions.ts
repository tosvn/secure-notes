"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "../lib/supabase/admin";
import { createClient } from "../lib/supabase/server";

export type NoteActionState = {
  message: string;
  isError: boolean;
  noteId?: string;
};

export type DeleteAccountActionState = {
  message: string;
  isError: boolean;
};

function isValidNoteId(noteId: string) {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(noteId);
}

function getNoteTags(formData: FormData): string[] | null {
  const value = formData.get("tags");
  if (value === null) return [];
  if (typeof value !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length > 20 ||
    parsed.some(
      (tag) =>
        typeof tag !== "string" ||
        tag.trim().length === 0 ||
        [...tag.trim()].length > 32,
    )
  ) {
    return null;
  }

  const uniqueTags: string[] = [];
  for (const tag of parsed) {
    const trimmedTag = tag.trim();
    if (
      !uniqueTags.some(
        (existingTag) =>
          existingTag.toLocaleLowerCase() === trimmedTag.toLocaleLowerCase(),
      )
    ) {
      uniqueTags.push(trimmedTag);
    }
  }

  return uniqueTags;
}

export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Unable to log out: ${error.message}`);
  }

  redirect("/login");
}

export async function deleteAccount(
  _previousState: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  if (formData.get("confirmation") !== "DELETE") {
    return {
      message: 'Type "DELETE" exactly to confirm account deletion.',
      isError: true,
    };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { message: "Enter your current password to continue.", isError: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify your account: ${userError.message}`);
  }

  if (!user?.email) {
    redirect("/login");
  }

  const { data: verified, error: passwordError } =
    await supabase.auth.signInWithPassword({ email: user.email, password });

  if (passwordError?.code === "invalid_credentials") {
    return {
      message: "The password is incorrect. Your account was not deleted.",
      isError: true,
    };
  }

  if (passwordError?.status === 429) {
    return {
      message: "Too many verification attempts. Please wait and try again.",
      isError: true,
    };
  }

  if (passwordError) {
    throw new Error(`Unable to verify your password: ${passwordError.message}`);
  }

  if (verified.user.id !== user.id) {
    return {
      message: "Unable to verify your account. Your account was not deleted.",
      isError: true,
    };
  }

  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    return {
      message: "Account deletion is not configured. Please contact support.",
      isError: true,
    };
  }

  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return {
      message: `Unable to delete your account: ${deleteError.message}`,
      isError: true,
    };
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    throw new Error(
      `Your account was deleted, but unable to clear this session: ${signOutError.message}`,
    );
  }

  redirect("/account-deleted");
}

export async function addNote(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const title = formData.get("title");
  const body = formData.get("body");
  const tags = getNoteTags(formData);

  if (typeof title !== "string" || title.trim() === "") {
    return { message: "Please enter a title.", isError: true };
  }

  if (typeof body !== "string") {
    return { message: "Please enter valid note text.", isError: true };
  }

  if (!tags) {
    return {
      message: "Use up to 20 tags, each no longer than 32 characters.",
      isError: true,
    };
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

  const { data: note, error } = await supabase
    .from("notes")
    .insert({ title: title.trim(), body, tags })
    .select("id")
    .single();

  if (error) {
    return { message: `Unable to save note: ${error.message}`, isError: true };
  }

  revalidatePath("/");
  return { message: "Note saved.", isError: false, noteId: note.id };
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
  const tags = getNoteTags(formData);

  if (typeof title !== "string" || title.trim() === "") {
    return { message: "Please enter a title.", isError: true };
  }

  if (typeof body !== "string") {
    return { message: "Please enter valid note text.", isError: true };
  }

  if (!tags) {
    return {
      message: "Use up to 20 tags, each no longer than 32 characters.",
      isError: true,
    };
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
      tags,
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
  return { message: "Note updated.", isError: false, noteId };
}

export async function setNotePinned(
  noteId: string,
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const pinnedValue = formData.get("pinned");

  if (
    !isValidNoteId(noteId) ||
    (pinnedValue !== "true" && pinnedValue !== "false")
  ) {
    return { message: "Unable to update the pin.", isError: true };
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
    .update({ is_pinned: pinnedValue === "true" })
    .eq("id", noteId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { message: `Unable to update pin: ${error.message}`, isError: true };
  }

  if (!data) {
    return { message: "Note not found.", isError: true };
  }

  revalidatePath("/");
  revalidatePath(`/notes/${noteId}`);
  return {
    message: pinnedValue === "true" ? "Note pinned." : "Note unpinned.",
    isError: false,
    noteId,
  };
}

export async function deleteNote(
  noteId: string,
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  void _previousState;

  if (!isValidNoteId(noteId)) {
    return { message: "Unable to delete note.", isError: true };
  }

  if (formData.get("confirmation") !== "DELETE") {
    return {
      message: "Confirm the deletion before continuing.",
      isError: true,
    };
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
