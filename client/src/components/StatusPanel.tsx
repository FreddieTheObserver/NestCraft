type StatusPanelProps = {
  eyebrow: string
  title: string
  message?: string
  tone?: 'neutral' | 'error'
  children?: React.ReactNode
  className?: string
}

function StatusPanel({
  eyebrow,
  title,
  message,
  tone = 'neutral',
  children,
  className = '',
}: StatusPanelProps) {
  const toneClassName =
    tone === 'error'
      ? 'editorial-status-error text-error'
      : 'editorial-panel-muted'

  const eyebrowClassName = tone === 'error' ? 'text-error' : 'text-primary'

  return (
    <div className={`rounded-xl px-7 py-8 shadow-ambient ${toneClassName} ${className}`.trim()}>
      <p className={`text-[0.72rem] font-bold uppercase tracking-[0.28em] ${eyebrowClassName}`}>
        {eyebrow}
      </p>
      <h1 className="editorial-heading mt-4 max-w-3xl">{title}</h1>
      {message ? <p className="editorial-copy mt-4 max-w-2xl">{message}</p> : null}
      {children}
    </div>
  )
}

export default StatusPanel
