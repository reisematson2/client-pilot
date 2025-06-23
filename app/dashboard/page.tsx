'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<
    Array<{ id: string; name: string; email: string; slug: string }>
  >([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        const { data } = await supabase
          .from('clients')
          .select('id, name, email, slug')
          .eq('user_id', session.user.id);
        setClients(data || []);
      }
      setLoading(false);
    };
    getSession();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !slug || !user) return;
    const { data, error } = await supabase
      .from('clients')
      .insert({ name, email, slug, user_id: user.id })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    if (data) {
      setClients([...clients, data]);
      setName('');
      setEmail('');
      setSlug('');
    }
  };

  if (loading) return <p>Loading...</p>;


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
        <form onSubmit={handleCreate} className="mb-8 space-y-2 max-w-md">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <input
            type="text"
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
          <button type="submit" className="rounded bg-blue-600 p-2 text-white">
            Add Client
          </button>
        </form>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="rounded border bg-white p-4 shadow">
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
