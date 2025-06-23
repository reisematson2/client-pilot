import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-center">
      <h1 className="mb-4 text-5xl font-bold">Client Pilot</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Manage your clients and tasks effortlessly with our intuitive dashboard.
      </p>
      <Link
        href="/dashboard"
        className="rounded bg-blue-600 px-6 py-3 font-semibold text-white"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
