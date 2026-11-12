This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

Login failures are rate-limited per normalized email address: after 3 failed
attempts, sign-in is paused for 10 seconds. Three additional failures require a
password reset before that address can sign in again. Successful login or a
successful password reset clears the counter. The database stores only a
SHA-256 hash of the email for this purpose.

To enable rate limiting and password reset:

1. Run `db/auth-rate-limiting.sql` once in the Supabase SQL Editor.
2. Set these environment variables locally and in your deployment:

   ```text
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
   ```

   Use the deployed site URL for `NEXT_PUBLIC_SITE_URL` in production. Get the
   service-role key from the Supabase project settings; never prefix it with
   `NEXT_PUBLIC_` or expose it to browser code.
3. In Supabase Authentication URL configuration, allow the callback URL
   `http://localhost:3000/auth/callback` and the matching deployed URL.
4. Configure Supabase Auth email delivery so password reset messages reach your
   users.

The login and sign-up forms are separate pages: visitors can create an account
at `/signup`, and use the link there to return to `/login`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
