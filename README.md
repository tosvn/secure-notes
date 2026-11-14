# NoteNest

A calm, private place to keep your notes organized.

The notes workspace fills the viewport with a sidebar, live search, pastel
note cards, a centered note reader, and an in-place editor. The page stays
fixed; responsive pagination keeps a readable number of cards on screen
without scrolling.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication setup

The login and sign-up actions validate email addresses and require passwords to
be at least 8 characters. Validation runs in the browser and again on the
server. Passwords may contain any characters; database-backed Supabase Auth is
used instead of building SQL from form input.

To allow users to sign up and log in without email confirmation, turn off
**Confirm email** in the Supabase project's Auth settings. Supabase's own
platform-level abuse protections still apply.

The login and sign-up forms are separate pages: visitors can create an account
at `/signup`, and use the link there to return to `/login`.

The dashboard also offers permanent account deletion. Users must re-enter their
password and type `DELETE`; deleting the auth user cascades to their notes.
This uses the server-only `SUPABASE_SERVICE_ROLE_KEY`; never prefix it with
`NEXT_PUBLIC_` or expose it to browser code.

If `db/auth-rate-limiting.sql` was previously run in Supabase, run
`db/remove-auth-rate-limiting.sql` once to remove its unused table and functions.

Notes can be pinned from their cards. Pinned notes remain in the database and
appear in the dashboard sidebar. Run `db/pin-notes.sql` once in the Supabase SQL
Editor to add pin support to an existing database; fresh installations include
the column in `db/schema.sql`.

Notes support up to 20 tags, each up to 32 characters. Tags can be added or
removed in the note editor, and search matches tags as well as titles and note
text. Run `db/note-tags.sql` once in the Supabase SQL Editor for an existing
database; fresh installations include the column in `db/schema.sql`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
