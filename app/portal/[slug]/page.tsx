interface PortalProps {
  params: { slug: string };
}

export default function Portal({ params }: PortalProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Portal: {params.slug}</h1>
      <p className="mt-4">Here clients can view tasks, fill forms, and upload files.</p>
    </div>
  );
}
