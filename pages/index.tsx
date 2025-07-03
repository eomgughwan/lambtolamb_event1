import React from 'react';

export default function MainLanding() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/lamb-main.jpg')", // 실제 이미지 경로로 교체
          filter: 'brightness(0.5)'
        }}
      />
      {/* 상단 네비 */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐑</span>
          <span className="text-yellow-300 font-bold text-xl">램투램</span>
        </div>
        <ul className="flex gap-8 text-white font-semibold">
          <li className="hover:text-yellow-300 cursor-pointer">브랜드</li>
          <li className="hover:text-yellow-300 cursor-pointer">메뉴</li>
          <li className="hover:text-yellow-300 cursor-pointer">매장안내</li>
          <li className="hover:text-yellow-300 cursor-pointer">이벤트</li>
          <li className="hover:text-yellow-300 cursor-pointer">문의</li>
        </ul>
      </nav>
      {/* 중앙 타이틀/버튼 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          15년 외길, 숯불에 구운 양고기의 품격
        </h1>
        <p className="text-lg md:text-2xl text-white mb-6 drop-shadow">
          대한민국 양고기 대표 브랜드<br />
          하루의 끝, 당신에게 위로가 되는 고기 한 점
        </p>
        <div className="flex gap-4">
          <button className="bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-red-600 transition">
            메뉴 보러가기
          </button>
          <button className="bg-white text-gray-900 px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-gray-200 transition">
            예약하기
          </button>
        </div>
      </div>
      {/* 우측 하단 챗봇/문의 버튼 */}
      <div className="fixed bottom-8 right-8 z-20 flex flex-col gap-2">
        <button className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
          💬 챗봇 문의
        </button>
      </div>
    </div>
  );
} 