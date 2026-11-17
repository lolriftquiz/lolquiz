import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080812] text-white">
      <h1 className="text-6xl font-black text-purple-400">404</h1>
      <p className="mt-4 text-gray-300">Aradığın sayfa bulunamadı.</p>
      <Link href="/" className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-bold">
        Ana Sayfaya Dön
      </Link>
    </main>
  );
}
