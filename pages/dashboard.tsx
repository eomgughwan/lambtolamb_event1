import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/db';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard() {
  const [todayReservations, setTodayReservations] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [notice, setNotice] = useState('오늘은 6월 이벤트 진행 중!');
  const [memo, setMemo] = useState('점심시간 예약 집중!');
  const [weather, setWeather] = useState('맑음 25°C');
  const [todayList, setTodayList] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTodayList();
    fetchRecents();
    fetchWeather();
  }, []);

  async function fetchDashboardData() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*')
      .gte('datetime', todayStart.toISOString())
      .lte('datetime', todayEnd.toISOString());
    setTodayReservations(reservations?.length || 0);

    const { data: customers } = await supabase.from('customers').select('*');
    setTotalCustomers(customers?.length || 0);

    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString());
    const total = (sales || []).reduce((sum, s) => sum + s.total, 0);
    setTodaySales(total);

    const salesByDate = {};
    (sales || []).forEach((s) => {
      const date = new Date(s.created_at).toLocaleDateString();
      if (!salesByDate[date]) salesByDate[date] = 0;
      salesByDate[date] += s.total;
    });
    const chartData = Object.keys(salesByDate).map((date) => ({ date, total: salesByDate[date] }));
    setWeeklySales(chartData);

    // 월별 매출 집계 (최근 12개월)
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        label: `${d.getFullYear().toString().slice(2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
      });
    }
    const { data: allSales } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString());
    const salesByMonth = {};
    (allSales || []).forEach((s) => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!salesByMonth[key]) salesByMonth[key] = 0;
      salesByMonth[key] += s.total;
    });
    const monthlyChart = months.map(m => ({ month: m.label, total: salesByMonth[m.key] || 0 }));
    setMonthlySales(monthlyChart);
  }

  async function fetchTodayList() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .gte('datetime', todayStart.toISOString())
      .lte('datetime', todayEnd.toISOString())
      .order('datetime', { ascending: true });
    setTodayList(data || []);
  }

  async function fetchRecents() {
    const { data: customers } = await supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(5);
    setRecentCustomers(customers || []);
    const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(5);
    setRecentSales(sales || []);
    const { data: reservations } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(5);
    setRecentReservations(reservations || []);
  }

  async function fetchWeather() {
    // 실제로는 외부 날씨 API 연동 필요, 여기서는 임시값
    setWeather('맑음 25°C');
  }

  async function handleQuickRegister(e) {
    e.preventDefault();
    if (!quickName || !quickPhone) return alert('이름과 전화번호를 입력하세요');
    await supabase.from('customers').insert({ name: quickName, phone: quickPhone });
    alert('고객이 등록되었습니다.');
    setQuickName(''); setQuickPhone('');
    fetchRecents();
    fetchDashboardData();
  }

  // 빠른 등록 버튼 핸들러(페이지 이동)
  function goTo(path) {
    window.location.href = path;
  }

  return (
    <div className="p-6">
      {/* 공지/알림 영역 */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded">
          <b>공지사항:</b> {notice}
        </div>
        <div className="flex-1 bg-blue-100 border-l-4 border-blue-400 p-4 rounded">
          <b>오늘의 메모:</b> {memo}
        </div>
        <div className="flex-1 bg-green-100 border-l-4 border-green-400 p-4 rounded">
          <b>오늘의 날씨:</b> {weather}
        </div>
      </div>

      {/* 빠른 전화번호 등록 */}
      <form onSubmit={handleQuickRegister} className="mb-4 flex gap-2">
        <input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="이름" className="border p-2 rounded" />
        <input value={quickPhone} onChange={e => setQuickPhone(e.target.value)} placeholder="전화번호" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">고객 빠른 등록</button>
      </form>

      {/* 빠른 등록 버튼 */}
      <div className="mb-6 flex gap-4">
        <button onClick={() => goTo('/customers')} className="bg-gray-200 px-4 py-2 rounded">고객 관리</button>
        <button onClick={() => goTo('/reservations')} className="bg-gray-200 px-4 py-2 rounded">예약 등록</button>
        <button onClick={() => goTo('/sales')} className="bg-gray-200 px-4 py-2 rounded">판매 등록</button>
        <button onClick={() => goTo('/menu')} className="bg-gray-200 px-4 py-2 rounded">메뉴 관리</button>
      </div>

      {/* 오늘 할 일/예약 리스트 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">오늘 예약 리스트</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">시간</th>
              <th className="border p-2">고객명</th>
              <th className="border p-2">전화번호</th>
              <th className="border p-2">인원</th>
              <th className="border p-2">메모</th>
            </tr>
          </thead>
          <tbody>
            {todayList.map(r => (
              <tr key={r.id}>
                <td className="border p-2">{new Date(r.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.phone}</td>
                <td className="border p-2">{r.people}</td>
                <td className="border p-2">{r.memo || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 최근 등록 요약 */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">최근 등록 고객</h2>
          <ul>
            {recentCustomers.map(c => (
              <li key={c.id} className="border-b py-1">{c.name} ({c.phone})</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">최근 판매</h2>
          <ul>
            {recentSales.map(s => (
              <li key={s.id} className="border-b py-1">{s.menu_items?.map(mi => mi.item).join(', ')} - {Number(s.total).toLocaleString()}원</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">최근 예약</h2>
          <ul>
            {recentReservations.map(r => (
              <li key={r.id} className="border-b py-1">{r.name} {new Date(r.datetime).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 기존 대시보드 카드/차트 */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">오늘 예약: {todayReservations}건</div>
        <div className="bg-white p-4 rounded shadow">누적 단골: {totalCustomers}명</div>
        <div className="bg-white p-4 rounded shadow">금일 매출: {todaySales.toLocaleString()}원</div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📈 최근 7일간 매출 추이</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📊 최근 12개월 월별 매출</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 