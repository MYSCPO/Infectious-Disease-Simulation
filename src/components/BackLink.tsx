import { Link, useLocation, useNavigate } from 'react-router-dom'

const CLASS = 'inline-block text-xs text-brand-700 underline'

// 자료실 화면은 메인·입장·결과 화면 어디서든 들어올 수 있어, `to`가 없으면 들어온 화면으로 되돌아간다.
export default function BackLink({ to, label = '← 이전 화면으로 돌아가기' }: { to?: string; label?: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (to) {
    return (
      <Link to={to} className={CLASS}>
        {label}
      </Link>
    )
  }

  const hasInAppHistory = location.key !== 'default'
  return (
    <button type="button" onClick={() => (hasInAppHistory ? navigate(-1) : navigate('/'))} className={CLASS}>
      {label}
    </button>
  )
}
