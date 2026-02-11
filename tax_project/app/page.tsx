import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-8 h-16 flex items-center border-b border-slate-100">
        <div className="font-bold text-xl text-blue-600">TaxStitch</div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Simplify Your Income Tax
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl">
                  Calculate, Plan, and Save. The most intuitive tax calculator for Indian taxpayers.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-slate-500">
          © 2024 TaxStitch Inc. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
