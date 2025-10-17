"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginEmailPasswordApi } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await loginEmailPasswordApi(email, password);
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(res.message || 'Login gagal');
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 flex items-center justify-center p-6">
      <Card className="w-full max-w-5xl h-[70vh] md:h-[76vh] max-h-[860px] border-0 shadow-xl rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Left: Form */}
            <div className="p-10 md:p-12 flex flex-col justify-center h-full">
              <div className="flex flex-col items-center text-center mb-6">
                {/* Logo, keep aspect ratio (no stretch) */}
                <img src="/logo_koperasi.png" alt="Logo Koperasi" className="h-12 w-auto object-contain mb-3" />
                <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
                <p className="text-sm text-muted-foreground mt-1">Silakan masuk untuk melanjutkan</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm" htmlFor="email">E-mail</label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm" htmlFor="password">Password</label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {error && (
                  <div className="text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>
            </div>

            {/* Right: Photo */}
            <div className="relative hidden md:block h-full">
              <img
                src="/Gemini_Generated_Image_p5woirp5woirp5wo.png"
                alt="Koperasi illustration"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* subtle left gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/0 to-black/0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
