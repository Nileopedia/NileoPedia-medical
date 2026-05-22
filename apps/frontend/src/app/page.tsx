import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          NileoPedia
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-Powered Medical Knowledge Platform
        </p>
        <Link 
          href="/auth/login" 
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}