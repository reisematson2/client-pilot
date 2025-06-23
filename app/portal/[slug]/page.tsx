'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

interface PortalProps {
  params: { slug: string };
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  is_complete: boolean;
}

export default function Portal({ params }: PortalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [label, setLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, is_complete')
        .eq('client_slug', params.slug)
        .order('due_date', { ascending: true });
      setTasks(data || []);
    };
    fetchTasks();
  }, [params.slug]);

  const toggleComplete = async (task: Task) => {
    await supabase
      .from('tasks')
      .update({ is_complete: !task.is_complete })
      .eq('id', task.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_complete: !t.is_complete } : t)),
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const path = `${params.slug}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('tasks').upload(path, file);
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = supabase.storage.from('tasks').getPublicUrl(path);
    await supabase
      .from('uploads')
      .insert({ client_slug: params.slug, file_url: data.publicUrl, label });
    setLabel('');
    setFile(null);
    const input = document.getElementById('file') as HTMLInputElement | null;
    if (input) input.value = '';
    alert('File uploaded');
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Tasks for {params.slug}</h1>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="rounded border bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="mt-1 text-sm text-gray-500">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <input
                type="checkbox"
                checked={task.is_complete}
                onChange={() => toggleComplete(task)}
                className="h-5 w-5 rounded border-gray-300"
              />
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleUpload} className="mt-8 space-y-2">
        <h2 className="text-xl font-semibold">Upload a file</h2>
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Upload
        </button>
      </form>
    </div>
  );
}
