import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, phone, datetime, people } = req.body;
  if (!name || !phone || !datetime || !people) {
    return res.status(400).json({ error: '필수 정보 누락' });
  }
  // 예약 정보 저장
  const { data, error } = await supabase.from('reservations').insert({ name, phone, datetime, people }).select().single();
  if (error) {
    return res.status(500).json({ error: 'DB 저장 실패', detail: error.message });
  }
  // TODO: 카카오 알림톡 연동 함수 호출 위치 (정보 준비되면 구현)
  // await sendKakaoAlimtalk({ name, phone, datetime, people });
  return res.status(200).json({ success: true, reservation: data });
} 