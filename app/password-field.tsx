"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  minLength?: number;
  required?: boolean;
};

const inputClassName =
  "w-full min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

export default function PasswordField({
  id,
  label,
  name,
  autoComplete,
  minLength,
  required = true,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-semibold text-slate-700"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <input
          className={inputClassName}
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl bg-white text-slate-500 transition hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-indigo-600"
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.7 10.7 0 0112 5c5 0 8.3 4.2 9.5 6.1a1.7 1.7 0 010 1.8 15 15 0 01-3 3.5M6.2 6.2a15 15 0 00-3.7 4.9 1.7 1.7 0 000 1.8C3.7 14.8 7 19 12 19c1.5 0 2.8-.4 4-1"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
