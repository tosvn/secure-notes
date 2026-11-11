# SPEC: Secure Notes

**Client brief:** "I run a lesson centre that prepares secondary school students for WAEC and JAMB. My tutors keep notes on each student's progress, and right now it's one shared Google Doc. Last month a tutor read another tutor's notes about a student and repeated them to a parent, and I had a very hard conversation. I want each tutor to have their own account with an email and password, write notes, fix them, delete them, and see **only their own**. Nobody else, not even another tutor who is good with computers, should be able to read them. The tutors mostly use their phones. If someone forgets to log out on the centre's laptop, the next person must not see their notes after they log out. Send me the link."

**Built:** Sunday 8 November, 6pm–8pm, in your group repo. **Delivered:** a public link, tested live by the client at 7:25 with two accounts on two devices.

## Done means (the client's acceptance criteria)

- [ ] 1. I can sign up with an email and a password of at least 8 characters, and log in. With a wrong password I'm told "Wrong email or password", and nothing more.
- [ ] 2. If I'm not logged in, every page sends me to the login page. I never see a note.
- [ ] 3. I can write a note with a title and some text. A note with no title is not saved, and I'm told why.
- [ ] 4. I see only my own notes, newest first, with the email I'm logged in as at the top. I can edit and delete my notes.
- [ ] 5. Another tutor, logged in on another device, never sees my notes, even if they type the address of one of my notes into the browser.
- [ ] 6. After I log out, going back or refreshing doesn't show my notes.
- [ ] 7. It works on my phone from the public link, and my notes are still there tomorrow.
- [ ] 8. The privacy is enforced by the database itself, so a mistake in the website can't leak notes. (We check: row-level security is on for the notes table, with a policy for each of select, insert, update and delete.)

## What the client told us

| Question | Answer |
| --- | --- |
| Can tutors share notes with each other? | No. Every note is private to the tutor who wrote it. |
| Can you, the owner, read every note in the app? | Not this week. |
| Forgot password? Log in with Google? | Not this week. |
| Do people need to confirm their email? | Not this week. We'll switch it on when the centre has its own email sender. |
| Formatting, like bold or lists? | Plain text is fine. Keep the line breaks. |
| How many notes? | Each tutor writes a few a day, so hundreds each by the end of the year. It must stay fast. |
| Delete an account? | Not this week. |
| Who signs up? | Anyone with the link, for now. I'll only give it to my tutors. |

## How we'll build it

- **This SPEC** is saved at the top of the group repo as `SPEC-secure-notes.md`, next to last week's `SPEC.md`.
- **Next.js** app in a folder called `secure-notes` in the group repo, styled with **Tailwind**. Pages: Login (`/login`), My notes (`/`) and Edit a note (`/notes/[id]`).
- **Supabase** project: use your group's existing `library-group-N` project. The notes table goes next to the library tables; logins use the project's built-in **Supabase Auth** (email and password). In Authentication settings, **Confirm email is off**.
- **Two settings in `.env.local`** (and in Vercel): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The publishable key is safe in a browser **because** row-level security decides what each user can do. The database password (`DATABASE_URL`) is **not** used in this app: it skips row-level security.
- **Plain SQL for the database:** the table, its index, row-level security and the four policies are written in `db/schema.sql`, committed to Git and run once in the Supabase **SQL Editor**.
- **The app talks to Supabase as the logged-in user,** with `@supabase/ssr` and `@supabase/supabase-js`. `lib/supabase/server.ts` makes the client; `proxy.ts` keeps the login fresh and sends logged-out visitors to `/login`.
- **No `where user_id = ...` in the app.** The database fills in `user_id` (`default auth.uid()`), and row-level security only shows each user their own rows. That's the point of the week.
- **Server actions** in `app/actions.ts` and `app/login/actions.ts` check every input before it goes to Supabase: never trust input.

## The table

| Table | Columns | Rules |
| --- | --- | --- |
| notes | id, user_id, title, body, created_at, updated_at | user_id points at auth.users and is filled in by the database (`default auth.uid()`); title required and not blank; body can be empty |

**Index:** `(user_id, created_at desc)`, because "my notes, newest first" runs on every visit.

**Row-level security:** on. Four policies for logged-in users (`to authenticated`), each with `user_id = auth.uid()`: select, insert (with check), update (using and with check) and delete. No policy for logged-out visitors (`anon`).

## Features to build (in this order)

| # | Feature | Done when | Driver |
| --- | --- | --- | --- |
| 1 | The notes table, locked down | `db/schema.sql` is in Git; in Supabase, **Table Editor** shows notes, and **Authentication → Policies** shows RLS enabled with 4 policies | Captain |
| 2 | Sign up, log in, log out | A new account can sign up and log in; a wrong password shows "Wrong email or password"; logged out, `/` goes to `/login` | Captain |
| 3 | My notes and New note | A saved note appears at the top; an empty title shows a message; the page shows who's logged in | Captain |
| 4 | Edit and delete | A note's title and text can be fixed; a note can be deleted | Captain |
| 5 | The two-account check | Account B sees none of A's notes, and A's `/notes/<id>` address shows "not found" for B | Captain + whole group |
| 6 | Live | Both settings added to Vercel; the live link passes the client test | Captain |

The captain drives every feature, sharing their screen. The group reads the code, suggests the next step and tests each feature (each member signs up with their own account in step 5) before the captain merges its pull request. At 7:10, add the two settings to Vercel. At 7:15, stop adding features and deploy with `npx vercel --prod`.

## The client test (Sunday, 7:25, on the live link)

1. Open the live link, logged out. (You land on the login page.)
2. Log in as tutor1@test.com with a wrong password. ("Wrong email or password.")
3. Sign up as tutor1@test.com. (An empty notes page that says "Logged in as tutor1@test.com".)
4. Save a note with no title. (A message, not a saved note.)
5. Save "Tolu, maths" with two lines of text, then "Ada, English". (Both appear, newest first, line breaks kept.)
6. Edit "Ada, English" to "Ada, English and Literature", then delete "Tolu, maths".
7. Click Edit on the remaining note and read its address aloud, like /notes/12. Log out, then press Back and refresh. (The login page, not the note.)
8. On a phone, sign up as tutor2@test.com. (No notes from tutor1.) Save one note.
9. On the phone, type the address from step 7. ("Not found".)
10. On the laptop, log in as tutor1@test.com again. (Their note is there; tutor2's isn't.)

## Not in scope this week

Forgot password, Google login, email confirmation, sharing notes, an owner or admin view, deleting accounts, search.
