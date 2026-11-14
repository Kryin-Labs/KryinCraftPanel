'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings');
  }, [router]);

  return (
    <div className="p-8 text-center text-zinc-400 font-mono text-xs">
      Redirecting to Settings...
    </div>
  );
}
