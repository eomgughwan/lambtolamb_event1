// NOTE: 아래 import 관련 linter 에러는 실제 Next.js/React 환경에서는 무시해도 됩니다.
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const restrictedRoutes = ['/dashboard', '/customers', '/reservations', '/menu', '/sales', '/users'];
    const staffAllowed = ['/customers', '/reservations'];
    const isAuth = localStorage.getItem('auth') === 'true';
    const role = localStorage.getItem('role');
    if (!isAuth && restrictedRoutes.includes(router.pathname)) {
      router.push('/login');
      return;
    }
    if (role === 'staff' && !staffAllowed.includes(router.pathname)) {
      router.push('/customers');
      return;
    }
    // admin은 전체 접근 가능
  }, [router.pathname]);

  function handleLogout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('role');
    router.push('/login');
  }

  // 로그인 페이지에서는 로그아웃 버튼 숨김
  const showLogout = router.pathname !== '/login';

  return (
    <>
      {showLogout && (
        <div className="w-full flex justify-end p-2 bg-gray-50 border-b">
          <button onClick={handleLogout} className="bg-gray-300 px-3 py-1 rounded">로그아웃</button>
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 