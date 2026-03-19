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
  const panelClassName =
    tone === 'error'
      ? 'border border-red-200 bg-white'
      : 'bg-white'

  const eyebrowClassName =
    tone === 'error'
      ? 'text-red-500'
      : 'text-clay'

  return (
    <div className={`rounded-[2rem] p-8 shadow-sm ${panelClassName} ${className}`.trim()}>
      <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${eyebrowClassName}`}>
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
      {message ? <p className="mt-3 text-stone-600">{message}</p> : null}
      {children}
    </div>
  )
}

export default StatusPanel
