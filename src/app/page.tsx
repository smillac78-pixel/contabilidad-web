import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Contabilidad Familiar
        </h1>
        <p className="text-gray-500 text-lg">Control de gastos del hogar</p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Ir al Dashboard
      </Link>
    </main>
  );
}
