import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services'

interface Props {
  email: string
  purpose: 'signup' | 'login'
  onSuccess: (user: any, accessToken: string) => void
  onBack: () => void
}

const LEN = 6

export default function OtpStep({ email, purpose, onSuccess, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''))
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(30)
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => { refs.current[0]?.focus() }, [])
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const code = digits.join('')

  const submit = async (value = code) => {
    if (value.length !== LEN || loading) return
    setLoading(true)
    try {
      const { data } = await authService.verifyOtp(email, value, purpose)
      onSuccess(data.data.user, data.data.accessToken)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Verification failed')
      setDigits(Array(LEN).fill(''))
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const setAt = (i: number, v: string) => {
    const d = v.replace(/\D/g, '')
    if (!d) {
      setDigits(prev => prev.map((x, idx) => (idx === i ? '' : x)))
      return
    }
    // handles typing one digit and pasting several
    const next = [...digits]
    d.slice(0, LEN - i).split('').forEach((ch, k) => { next[i + k] = ch })
    setDigits(next)
    const focusAt = Math.min(i + d.length, LEN - 1)
    refs.current[focusAt]?.focus()
    if (next.every(Boolean)) submit(next.join(''))
  }

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); return }
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  const resend = async () => {
    try {
      await authService.resendOtp(email, purpose)
      toast.success('A new code was sent')
      setCooldown(30)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Could not resend code')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'transparent' }}>
      <div className="w-full max-w-sm cv-card p-6 text-center">
        <MailCheck className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
        <h1 className="text-xl font-bold text-ink-1">Enter verification code</h1>
        <p className="text-sm text-ink-3 mt-2">
          We emailed a 6-digit code to <b>{email}</b>. It expires in 10 minutes.
        </p>

        <div className="flex justify-center gap-2 mt-5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              value={d}
              onChange={e => setAt(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              onFocus={e => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={LEN}
              aria-label={`Digit ${i + 1}`}
              className="cv-input text-center text-lg font-semibold"
              style={{ width: 42, height: 48, padding: 0 }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => submit()}
          disabled={code.length !== LEN || loading}
          className="btn-primary w-full py-2.5 mt-5"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : purpose === 'signup' ? 'Verify & create account' : 'Verify & sign in'}
        </button>

        <div className="flex items-center justify-between text-sm mt-4">
          <button type="button" onClick={onBack} className="text-ink-3 hover:text-ink-1">
            ← Back
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="font-medium disabled:opacity-50"
            style={{ color: 'var(--accent)' }}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
        <p className="text-xs text-ink-3 mt-4">Check your spam folder if you don't see it.</p>
        <Link to="/" className="sr-only">Home</Link>
      </div>
    </div>
  )
}
