'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
<<<<<<< HEAD
=======
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
>>>>>>> origin/9uq2kt-codex/create-next.js-app-with-typescript-and-tailwind-css

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
<<<<<<< HEAD
=======
        const { data } = await supabase
          .from('clients')
          .select('id, name')
          .eq('user_id', session.user.id);
        setClients(data || []);
>>>>>>> origin/9uq2kt-codex/create-next.js-app-with-typescript-and-tailwind-css
      }
      setLoading(false);
    };
    getSession();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <p>Loading...</p>;

<<<<<<< HEAD
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <p className="mb-2">Logged in as {user?.email}</p>
      <button
        onClick={handleLogout}
        className="rounded bg-red-500 p-2 text-white"
      >
        Logout
      </button>
=======
  const displayedClients = [...clients, { id: 'dummy', name: 'ACME Corp' }];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="mb-4 text-xl font-semibold">Menu</h2>
        <nav className="space-y-2">
          <button
            onClick={handleLogout}
            className="block w-full rounded bg-red-500 p-2 text-white"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="mb-4 text-2xl font-bold">Clients</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedClients.map((client) => (
            <div
              key={client.id}
              className="rounded border bg-white p-4 shadow"
            >
              <h3 className="text-lg font-semibold">{client.name}</h3>
            </div>
          ))}
        </div>
      </main>
>>>>>>> origin/9uq2kt-codex/create-next.js-app-with-typescript-and-tailwind-css
    </div>
  );
}
