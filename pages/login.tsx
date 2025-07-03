// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/db';
// NOTE: bcryptjs는 브라우저에서 동작하지 않으므로 실제 서비스에서는 서버(API Route)에서 비밀번호 검증 필요
// 여기서는 데모용으로 비교만 남겨둡니다.

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    // Supabase에서 유저 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error || !user) {
      alert('존재하지 않는 계정입니다.');
      setLoading(false);
      return;
    }
    // 비밀번호 비교 (실제 서비스에서는 서버에서 검증해야 함)
    if (user.password_hash !== password) {
      alert('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    // 로그인 성공: localStorage에 auth, role 저장
    localStorage.setItem('auth', 'true');
    localStorage.setItem('role', user.role);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">🔐 관리자/직원 로그인</h1>
      <input
        type="text"
        placeholder="아이디"
        className="border p-2 mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        className="border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </div>
  );
} 