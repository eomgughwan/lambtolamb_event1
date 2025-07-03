// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/db';

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);

  useEffect(() => {
    if (id) fetchData();
    // eslint-disable-next-line
  }, [id]);

  async function fetchData() {
    setLoading(true);
    // 고객 정보
    const { data: cust } = await supabase.from('customers').select('*').eq('id', id).single();
    setCustomer(cust);
    setMemo(cust?.memo || '');
    // 예약 내역
    const { data: resvs } = await supabase.from('reservations').select('*').eq('phone', cust.phone).order('datetime', { ascending: false });
    setReservations(resvs || []);
    // 판매 내역 (고객 전화번호로 검색, 실제로는 customerId로 연결하는 것이 더 안전)
    const { data: salesData } = await supabase.from('sales').select('*').contains('menu_items', []).order('created_at', { ascending: false });
    setSales((salesData || []).filter(s => s.phone === cust.phone));
    setLoading(false);
  }

  async function handleMemoSave() {
    setMemoSaving(true);
    const { error } = await supabase.from('customers').update({ memo }).eq('id', id);
    if (!error) {
      alert('메모가 저장되었습니다.');
      fetchData();
    } else {
      alert('메모 저장 실패: ' + error.message);
    }
    setMemoSaving(false);
  }

  if (loading || !customer) return <div className="p-6">로딩 중...</div>;

  // 방문 횟수, 누적 매출, 최근 방문일 계산
  const visitCount = reservations.length;
  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const lastVisit = reservations[0]?.datetime || null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">👤 고객 상세</h1>
      <div className="mb-4">
        <div><b>이름:</b> {customer.name}</div>
        <div><b>전화번호:</b> {customer.phone}</div>
        <div><b>방문 횟수:</b> {visitCount}회</div>
        <div><b>누적 매출:</b> {totalSales.toLocaleString()}원</div>
        <div><b>최근 방문일:</b> {lastVisit ? new Date(lastVisit).toLocaleString() : '-'}</div>
        <div className="mt-2">
          <b>메모:</b>
          <textarea
            className="border p-2 w-full mt-1"
            rows={3}
            value={memo}
            onChange={e => setMemo(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded mt-1"
            onClick={handleMemoSave}
            disabled={memoSaving}
          >
            {memoSaving ? '저장 중...' : '메모 저장'}
          </button>
        </div>
      </div>
      <h2 className="text-xl font-semibold mt-6 mb-2">📅 예약 내역</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th className="border p-2">예약일시</th>
            <th className="border p-2">인원</th>
            <th className="border p-2">메모</th>
            <th className="border p-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{new Date(r.datetime).toLocaleString()}</td>
              <td className="border p-2">{r.people}</td>
              <td className="border p-2">{r.memo || '-'}</td>
              <td className="border p-2">{r.status || '확정'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-xl font-semibold mb-2">💳 판매 내역</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">일시</th>
            <th className="border p-2">메뉴</th>
            <th className="border p-2">총액</th>
            <th className="border p-2">결제수단</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td className="border p-2">{new Date(s.created_at).toLocaleString()}</td>
              <td className="border p-2">{(s.menu_items || []).map(mi => `${mi.item}(${mi.qty})`).join(', ')}</td>
              <td className="border p-2">{Number(s.total).toLocaleString()}원</td>
              <td className="border p-2">{s.payment_method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 