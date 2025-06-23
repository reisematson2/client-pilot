'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import supabase from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<
    Array<{ id: string; name: string; email: string; slug: string }>
  >([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    is_complete: boolean;
  }
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [newTasks, setNewTasks] = useState<
    Record<string, { title: string; description: string; due_date: string }>
  >({});

  const loadTasks = async (slug: string) => {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, description, due_date, is_complete')
      .eq('client_slug', slug)
      .order('due_date', { ascending: true });
    setTasks((prev) => ({ ...prev, [slug]: data || [] }));
  };

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
        (data || []).forEach((c) => loadTasks(c.slug));
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
      loadTasks(data.slug);
      setName('');
      setEmail('');
      setSlug('');
    }
  };

  const handleAddTask = async (
    e: React.FormEvent,
    slug: string,
  ) => {
    e.preventDefault();
    const values = newTasks[slug];
    if (!values?.title) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: values.title,
        description: values.description || null,
        due_date: values.due_date || null,
        client_slug: slug,
      })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    if (data) {
      setTasks((prev) => ({
        ...prev,
        [slug]: [...(prev[slug] || []), data],
      }));
      setNewTasks((prev) => ({
        ...prev,
        [slug]: { title: '', description: '', due_date: '' },
      }));
    }
  };

  const toggleComplete = async (slug: string, task: Task) => {
    await supabase
      .from('tasks')
      .update({ is_complete: !task.is_complete })
      .eq('id', task.id);
    setTasks((prev) => ({
      ...prev,
      [slug]: prev[slug].map((t) =>
        t.id === task.id ? { ...t, is_complete: !t.is_complete } : t,
      ),
    }));
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

              <ul className="mt-4 space-y-2">
                {(tasks[client.slug] || []).map((task) => (
                  <li key={task.id} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 mt-1"
                      checked={task.is_complete}
                      onChange={() => toggleComplete(client.slug, task)}
                    />
                  </li>
                ))}
              </ul>

              <form
                onSubmit={(e) => handleAddTask(e, client.slug)}
                className="mt-4 space-y-2"
              >
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTasks[client.slug]?.title || ''}
                  onChange={(e) =>
                    setNewTasks((prev) => ({
                      ...prev,
                      [client.slug]: {
                        ...prev[client.slug],
                        title: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded border p-2"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newTasks[client.slug]?.description || ''}
                  onChange={(e) =>
                    setNewTasks((prev) => ({
                      ...prev,
                      [client.slug]: {
                        ...prev[client.slug],
                        description: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded border p-2"
                />
                <input
                  type="date"
                  value={newTasks[client.slug]?.due_date || ''}
                  onChange={(e) =>
                    setNewTasks((prev) => ({
                      ...prev,
                      [client.slug]: {
                        ...prev[client.slug],
                        due_date: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded border p-2"
                />
                <button
                  type="submit"
                  className="rounded bg-green-600 px-3 py-1 text-white"
                >
                  Add Task
                </button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
