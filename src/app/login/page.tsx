import Link from "next/link";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 px-6">
      <div className="w-full max-w-md">
        <Link className="mb-6 inline-block text-sm text-zinc-600" href="/">
          ← На главную
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
