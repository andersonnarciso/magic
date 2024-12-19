import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto max-w-[1600px] h-16 flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          Ferramentas FII
        </Link>
      </div>
    </header>
  )
}
