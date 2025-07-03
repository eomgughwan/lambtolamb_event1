import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/db';

export default function ReservationsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [datetime, setDatetime] = useState('');
  const [people, setPeople] = useState(1);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    const { data, error } = await supabase.from('reservations').select('*').order('datetime', { ascending: false });
    if (!error && data) {
      setReservations(data);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // API Route로 예약 등록
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, datetime, people })
    });
    const result = await res.json();
    if (result.success) {
      alert('예약이 등록되었습니다.');
      setName(''); setPhone(''); setDatetime(''); setPeople(1);
      fetchReservations();
    } else {
      alert(result.error || '예약 등록 실패');
    }
  }

  async function handleDelete(id) {
    await supabase.from('reservations').delete().eq('id', id);
    fetchReservations();
  }

  async function handleEdit(id, field, value) {
    await supabase.from('reservations').update({ [field]: value }).eq('id', id);
    fetchReservations();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 예약관리</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="고객 이름" className="border p-2 w-full" />
        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="전화번호" className="border p-2 w-full" />
        <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="border p-2 w-full" />
        <input type="number" value={people} onChange={e => setPeople(Number(e.target.value))} placeholder="인원 수" className="border p-2 w-full" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">예약 등록</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">📋 예약 목록</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">고객명</th>
            <th className="border p-2">전화번호</th>
            <th className="border p-2">예약시간</th>
            <th className="border p-2">인원</th>
            <th className="border p-2">관리</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">
                <input value={r.name} onChange={(e) => handleEdit(r.id, 'name', e.target.value)} className="w-full" />
              </td>
              <td className="border p-2">
                <input value={r.phone} onChange={(e) => handleEdit(r.id, 'phone', e.target.value)} className="w-full" />
              </td>
              <td className="border p-2">
                <input type="datetime-local" value={r.datetime?.slice(0,16)} onChange={(e) => handleEdit(r.id, 'datetime', e.target.value)} className="w-full" />
              </td>
              <td className="border p-2">
                <input type="number" value={r.people} onChange={(e) => handleEdit(r.id, 'people', Number(e.target.value))} className="w-full" />
              </td>
              <td className="border p-2 text-center">
                <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 