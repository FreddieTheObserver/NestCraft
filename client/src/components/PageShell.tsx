import StoreHeader from './StoreHeader'
import ThemeToggle from './ThemeToggle'

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
    <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-4 text-ink sm:px-7 sm:py-6 lg:px-12 lg:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-0 h-40 w-[40%] rounded-b-[3rem] bg-[var(--shell-top-glow)] blur-[70px]" />
        <div className="absolute left-[-12rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute right-[-6rem] top-[10rem] h-[24rem] w-[18rem] rounded-[3rem] bg-[var(--shell-side-glow)] blur-[90px]" />
        <div className="absolute bottom-[-8rem] left-[12%] h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[12%] right-[10%] h-48 w-48 rounded-full bg-surface-high/70 blur-[95px]" />
      </div>

      <section
        className={`relative z-10 mx-auto ${maxWidthClass} space-y-12 pb-10 editorial-reveal ${sectionClassName}`.trim()}
      >
        {showHeader ? (
          <StoreHeader />
        ) : (
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        )}
        {children}
      </section>
    </main>
  )
}

export default PageShell
