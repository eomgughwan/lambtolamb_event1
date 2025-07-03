// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/db';
import { useRouter } from 'next/router';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 관리자만 접근 가능
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      alert('관리자만 접근 가능합니다.');
      router.push('/dashboard');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('id, username, role, created_at');
    setUsers(data || []);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    // 실제 서비스에서는 비밀번호를 해시해서 저장해야 함(여기서는 평문 저장, 추후 개선)
    const { error } = await supabase.from('users').insert({ username, password_hash: password, role });
    if (error) {
      alert('계정 생성 실패: ' + error.message);
    } else {
      setUsername(''); setPassword(''); setRole('staff');
      fetchUsers();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 직원 계정 관리</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="아이디" className="border p-2" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" className="border p-2" required />
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2">
          <option value="staff">직원</option>
          <option value="admin">관리자</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>{loading ? '생성 중...' : '계정 생성'}</button>
      </form>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">아이디</th>
            <th className="border p-2">권한</th>
            <th className="border p-2">생성일</th>
            <th className="border p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">{u.created_at ? new Date(u.created_at).toLocaleString() : '-'}</td>
              <td className="border p-2 text-center">
                <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-2 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 