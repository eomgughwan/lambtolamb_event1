// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect, useState } from 'react';

const scenarioList = [
  {
    key: 'after_reservation',
    label: '예약 완료 시 자동 메시지',
    desc: '예약이 등록되면 고객에게 안내 메시지 자동 발송'
  },
  {
    key: 'after_visit',
    label: '방문 후 리뷰 요청',
    desc: '방문 완료 후 리뷰/만족도 조사 메시지 자동 발송'
  },
  {
    key: 'no_visit_30',
    label: '30일 미방문 고객 메시지',
    desc: '30일 이상 방문 없는 고객에게 자동 메시지 발송'
  },
  {
    key: 'birthday',
    label: '생일 고객 축하 메시지',
    desc: '생일 당일 자동 메시지 발송'
  },
  {
    key: 'vip_event',
    label: 'VIP/이벤트 대상 메시지',
    desc: 'VIP 등급 또는 이벤트 대상자에게 자동 메시지 발송'
  }
];

export default function MarketingPage() {
  const [settings, setSettings] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  async function fetchSettings() {
    // TODO: 실제로는 supabase에서 마케팅 자동화 설정 fetch
    setSettings({
      after_reservation: true,
      after_visit: false,
      no_visit_30: true,
      birthday: true,
      vip_event: false
    });
  }

  async function fetchLogs() {
    // TODO: 실제로는 supabase에서 발송 내역 fetch
    setLogs([
      { id: 1, scenario: 'birthday', target: '홍길동', phone: '010-1234-5678', date: '2024-06-01', status: '성공' },
      { id: 2, scenario: 'no_visit_30', target: '김철수', phone: '010-2222-3333', date: '2024-05-30', status: '성공' },
      { id: 3, scenario: 'after_reservation', target: '이영희', phone: '010-4444-5555', date: '2024-05-29', status: '실패' }
    ]);
  }

  function handleToggle(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: supabase에 설정 저장
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💬 마케팅 자동화 관리</h1>
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarioList.map(s => (
          <div key={s.key} className="border rounded p-4 bg-white flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.label}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={!!settings[s.key]} onChange={() => handleToggle(s.key)} className="mr-2" />
                <span>{settings[s.key] ? 'ON' : 'OFF'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-2">📋 발송 내역/성공률</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">시나리오</th>
            <th className="border p-2">고객명</th>
            <th className="border p-2">전화번호</th>
            <th className="border p-2">발송일</th>
            <th className="border p-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td className="border p-2">{scenarioList.find(s => s.key === l.scenario)?.label || l.scenario}</td>
              <td className="border p-2">{l.target}</td>
              <td className="border p-2">{l.phone}</td>
              <td className="border p-2">{l.date}</td>
              <td className="border p-2">{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 