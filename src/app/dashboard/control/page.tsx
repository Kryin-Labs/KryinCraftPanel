'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ControlPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="p-8 text-center text-zinc-400 font-mono text-xs">
      Redirecting to Overview...
    </div>
  );
}
