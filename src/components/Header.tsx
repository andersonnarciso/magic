import Link from 'next/link'
import { HeaderIndicators } from './HeaderIndicators'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-[1400px] h-16 flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          Invest Tools
        </Link>
        <HeaderIndicators />
      </div>
    </header>
  )
}
