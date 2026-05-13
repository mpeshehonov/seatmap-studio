"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const supabase = createClient();

    if (!supabase) {
      setMessage("Добавьте Supabase env-переменные, чтобы включить вход.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setMessage(
      error
        ? `Не удалось отправить ссылку: ${error.message}`
        : "Проверьте почту: ссылка для входа отправлена.",
    );
    setIsSubmitting(false);
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm"
      onSubmit={submitMagicLink}
    >
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Вход в админку</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Для прототипа используем magic link через Supabase Auth.
        </p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-500"
          placeholder="admin@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Отправляем..." : "Получить ссылку для входа"}
      </button>
      {message ? (
        <p className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
