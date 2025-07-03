// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/db';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function StatisticsPage() {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [menuTop, setMenuTop] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [visitStats, setVisitStats] = useState([]);
  const [cancelStats, setCancelStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    // 월별 매출/예약/고객수
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        label: `${d.getFullYear().toString().slice(2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
      });
    }
    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString());
    const { data: reservations } = await supabase
      .from('reservations')
      .select('*')
      .gte('datetime', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString());
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString());
    const salesByMonth = {}, resByMonth = {}, custByMonth = {};
    (sales || []).forEach((s) => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!salesByMonth[key]) salesByMonth[key] = 0;
      salesByMonth[key] += s.total;
    });
    (reservations || []).forEach((r) => {
      const d = new Date(r.datetime);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!resByMonth[key]) resByMonth[key] = 0;
      resByMonth[key]++;
    });
    (customers || []).forEach((c) => {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!custByMonth[key]) custByMonth[key] = 0;
      custByMonth[key]++;
    });
    setMonthlyStats(months.map(m => ({
      month: m.label,
      매출: salesByMonth[m.key] || 0,
      예약: resByMonth[m.key] || 0,
      신규고객: custByMonth[m.key] || 0
    })));

    // 메뉴별 매출 TOP5
    const menuMap = {};
    (sales || []).forEach((s) => {
      (s.menu_items || []).forEach((mi) => {
        if (!menuMap[mi.item]) menuMap[mi.item] = 0;
        menuMap[mi.item] += (mi.price || 0) * (mi.qty || 1);
      });
    });
    const menuArr = Object.entries(menuMap).map(([item, total]) => ({ item, total }));
    setMenuTop(menuArr.sort((a, b) => b.total - a.total).slice(0, 5));

    // 결제수단별 비율
    const paymentMap = {};
    (sales || []).forEach((s) => {
      if (!paymentMap[s.payment_method]) paymentMap[s.payment_method] = 0;
      paymentMap[s.payment_method] += s.total;
    });
    setPaymentStats(Object.entries(paymentMap).map(([name, value]) => ({ name, value })));

    // 신규/재방문 비율 (고객별 첫 예약이 이번달이면 신규)
    const visitMap = {};
    (reservations || []).forEach((r) => {
      if (!visitMap[r.phone]) visitMap[r.phone] = [];
      visitMap[r.phone].push(r.datetime);
    });
    let newCount = 0, repeatCount = 0;
    Object.values(visitMap).forEach((dates) => {
      dates.sort();
      if (dates[0] >= new Date(now.getFullYear(), now.getMonth(), 1).toISOString()) newCount++;
      else repeatCount++;
    });
    setVisitStats([
      { name: '신규', value: newCount },
      { name: '재방문', value: repeatCount }
    ]);

    // 예약 취소/노쇼 통계
    let confirmed = 0, cancelled = 0, noshow = 0;
    (reservations || []).forEach((r) => {
      if (r.status === 'cancelled') cancelled++;
      else if (r.status === 'no-show') noshow++;
      else confirmed++;
    });
    setCancelStats([
      { name: '확정', value: confirmed },
      { name: '취소', value: cancelled },
      { name: '노쇼', value: noshow }
    ]);
  }

  // 엑셀 다운로드(간단 예시)
  function handleExcelDownload() {
    alert('엑셀 다운로드 기능은 추후 구현 필요 (xlsx 패키지 활용)');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📈 통계 대시보드</h1>
      <button onClick={handleExcelDownload} className="bg-green-500 text-white px-4 py-2 rounded mb-6">엑셀 다운로드</button>
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">월별 매출/예약/신규고객</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="매출" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="예약" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="신규고객" stroke="#ffc658" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">메뉴별 매출 TOP5</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={menuTop} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="item" type="category" />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">결제수단별 비율</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {paymentStats.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">신규/재방문 비율</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={visitStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {visitStats.map((entry, idx) => (
                  <Cell key={`cell2-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">예약 확정/취소/노쇼 통계</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cancelStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {cancelStats.map((entry, idx) => (
                  <Cell key={`cell3-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 