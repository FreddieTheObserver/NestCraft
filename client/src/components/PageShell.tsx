import StoreHeader from './StoreHeader'

type PageShellProps = {
  children: React.ReactNode
  maxWidth?: '4xl' | '6xl' | '7xl'
  showHeader?: boolean
  sectionClassName?: string
}

const maxWidthClassBySize = {
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const

function PageShell({
  children,
  maxWidth = '7xl',
  showHeader = true,
  sectionClassName = '',
}: PageShellProps) {
  const maxWidthClass = maxWidthClassBySize[maxWidth]

  return (
    <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
      <section className={`mx-auto ${maxWidthClass} space-y-8 ${sectionClassName}`.trim()}>
        {showHeader ? <StoreHeader /> : null}
        {children}
      </section>
    </main>
  )
}

export default PageShell
