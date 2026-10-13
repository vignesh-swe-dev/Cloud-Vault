import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Cloud, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { authService } from '../services'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? '' : 'Missing verification token.')
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true
    authService.verifyEmail(token)
      .then(() => setState('ok'))
      .catch((err: any) => {
        setMessage(err?.response?.data?.message ?? 'Verification failed')
        setState('error')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm cv-card p-6 text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Cloud className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
        </Link>
        {state === 'loading' && (<><Loader2 className="w-8 h-8 mx-auto animate-spin" /><p className="mt-3 text-ink-3">Verifying your email…</p></>)}
        {state === 'ok' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--ok)' }} />
            <h1 className="text-xl font-bold text-ink-1">Email verified</h1>
            <p className="text-sm text-ink-3 mt-2">Your account is active.</p>
            <Link to="/login" className="btn-primary w-full py-2.5 mt-5 inline-flex justify-center">Sign in</Link>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--danger)' }} />
            <h1 className="text-xl font-bold text-ink-1">Verification failed</h1>
            <p className="text-sm text-ink-3 mt-2">{message} Sign in to request a new link.</p>
            <Link to="/login" className="btn-primary w-full py-2.5 mt-5 inline-flex justify-center">Go to sign in</Link>
          </>
        )}
      </div>
    </div>
  )
}
