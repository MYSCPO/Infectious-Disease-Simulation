import { useState } from 'react'

// 진행자 화면 오른쪽 위에 늘 떠 있는 참가 QR. 늦게 온 참가자가 빔프로젝터 화면을 찍어 바로 입장한다.
export default function JoinQrBadge({ code }: { code: string }) {
  // 좁은 화면에서는 내용을 가리지 않도록 처음엔 접어 둔다.
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)
  const [enlarged, setEnlarged] = useState(false)
  const joinUrl = `${window.location.origin}/join/${code}`
  const qr = (size: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(joinUrl)}`

  return (
    <>
      <div className="fixed top-3 right-3 z-40">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-full bg-white border-2 border-brand-300 shadow-lg px-3 py-1.5 text-sm font-black tracking-widest text-brand-700 hover:bg-brand-50"
            title="참가 QR 펼치기"
          >
            📱 {code}
          </button>
        ) : (
          <div className="rounded-2xl bg-white border-2 border-brand-300 shadow-lg p-2 w-[132px] text-center">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500">참가 QR</span>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
                title="접기"
              >
                ▲ 접기
              </button>
            </div>
            <button type="button" onClick={() => setEnlarged(true)} title="크게 보기" className="block w-full">
              <img src={qr(220)} alt="참가 QR 코드" className="w-full rounded-lg border border-slate-100" />
            </button>
            <p className="text-base font-black tracking-widest text-brand-700 mt-1">{code}</p>
            <p className="text-[10px] text-slate-400">누르면 크게 보여요</p>
          </div>
        )}
      </div>

      {enlarged && (
        <button
          type="button"
          onClick={() => setEnlarged(false)}
          className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-6 cursor-pointer"
        >
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl">
            <p className="text-lg font-bold text-slate-700 mb-3">📱 휴대폰 카메라로 찍어 입장하세요</p>
            <img src={qr(480)} alt="참가 QR 코드" className="w-[min(70vh,480px)] h-[min(70vh,480px)] mx-auto" />
            <p className="text-5xl font-black tracking-[0.3em] text-brand-700 mt-4">{code}</p>
            <p className="text-sm text-slate-400 mt-3">화면을 누르면 닫혀요</p>
          </div>
        </button>
      )}
    </>
  )
}
