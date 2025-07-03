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

  useEffect(() => {
    fetchDashboardData();
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
      .gte('created_at', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📊 램투램 통합 대시보드</h1>
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