"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export type NoteActionState = {
  message: string;
  isError: boolean;
};

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
