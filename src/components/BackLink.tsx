import { useLocation, useNavigate } from 'react-router-dom'

const CLASS = 'inline-block text-xs text-brand-700 underline'

// `to`가 없으면 들어온 화면으로 되돌아간다(자료실은 메인·입장·결과 화면 어디서든 들어올 수 있음).
// `to`가 있어도 실제로 그 화면에서 들어왔다면(state.from) 새 기록을 쌓지 않고 뒤로 가야,
// 상위 화면의 "이전 화면으로" 버튼이 다시 이 화면으로 돌아오는 루프가 생기지 않는다.
export default function BackLink({ to, label = '← 이전 화면으로 돌아가기' }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasInAppHistory = location.key !== 'default'
  const cameFromTarget = (location.state as { from?: string } | null)?.from === to

  function handleClick() {
    if (to && !(hasInAppHistory && cameFromTarget)) navigate(to, { replace: true })
    else if (hasInAppHistory) navigate(-1)
    else navigate('/')
  }

  return (
    <button type="button" onClick={handleClick} className={CLASS}>
      {label}
    </button>
  )
}
