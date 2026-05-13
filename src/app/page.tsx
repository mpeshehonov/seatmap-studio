import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <nav className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
              Seatmap Studio
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight text-zinc-950">
              Прототип редактора залов и виджета выбора мест
            </h1>
          </div>
          <Link
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            href="/login"
          >
            Войти
          </Link>
        </nav>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Supabase Auth и RLS для разных аккаунтов",
            "Несколько площадок и залов в одной админке",
            "Публичный embed-виджет для iframe-встраивания",
          ].map((item) => (
            <div key={item} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-zinc-900">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="max-w-3xl text-xl leading-8 text-zinc-700">
            MVP устроен как один Next.js-проект для бесплатного деплоя на
            Vercel: админка, API routes, публичный viewer и Supabase в качестве
            Auth/Postgres backend.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
              href="/dashboard"
            >
              Открыть админку
            </Link>
            <Link
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900"
              href="/embed/demo-hall"
            >
              Посмотреть embed
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
