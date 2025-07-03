// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/db';

export default function SalesPage() {
  const [menuList, setMenuList] = useState([]);
  const [items, setItems] = useState([{ menuId: '', qty: 1 }]);
  const [payment, setPayment] = useState('카드');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    // 총액 자동 계산
    let sum = 0;
    items.forEach((row) => {
      const menu = menuList.find((m) => m.id === Number(row.menuId));
      if (menu) sum += Number(menu.price) * Number(row.qty);
    });
    setTotal(sum);
  }, [items, menuList]);

  async function fetchMenu() {
    const { data } = await supabase.from('menu').select('*');
    setMenuList(data || []);
  }

  function handleItemChange(idx, field, value) {
    setItems((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  function addRow() {
    setItems([...items, { menuId: '', qty: 1 }]);
  }

  function removeRow(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const menu_items = items
      .filter((row) => row.menuId)
      .map((row) => {
        const menu = menuList.find((m) => m.id === Number(row.menuId));
        return { item: menu?.name, price: menu?.price, qty: row.qty };
      });
    await supabase.from('sales').insert({ menu_items, total, payment_method: payment });
    alert('판매 기록이 저장되었습니다.');
    setItems([{ menuId: '', qty: 1 }]);
    setPayment('카드');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💰 판매관리 (POS)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <table className="w-full border mb-2">
          <thead>
            <tr>
              <th className="border p-2">메뉴</th>
              <th className="border p-2">수량</th>
              <th className="border p-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2">
                  <select
                    className="border p-2 w-full"
                    value={row.menuId}
                    onChange={e => handleItemChange(idx, 'menuId', e.target.value)}
                  >
                    <option value="">메뉴 선택</option>
                    {menuList.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({Number(m.price).toLocaleString()}원)</option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    min={1}
                    value={row.qty}
                    onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                    className="border p-2 w-full"
                  />
                </td>
                <td className="border p-2 text-center">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(idx)} className="text-red-500">삭제</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addRow} className="bg-gray-200 px-3 py-1 rounded">+ 메뉴 추가</button>
        <div className="mt-4">
          <span className="font-semibold">총액: {total.toLocaleString()}원</span>
        </div>
        <select value={payment} onChange={e => setPayment(e.target.value)} className="border p-2 w-full">
          <option>카드</option>
          <option>현금</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">판매 등록</button>
      </form>
    </div>
  );
} 