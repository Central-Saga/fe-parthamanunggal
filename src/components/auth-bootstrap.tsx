"use client";

import { useEffect, useRef } from 'react';
import { autoLoginIfEnabled } from '@/lib/auth';

export default function AuthBootstrap() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    autoLoginIfEnabled().then((ok) => {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[auth] autoLoginIfEnabled result:', ok);
      }
    });
  }, []);
  return null;
}

