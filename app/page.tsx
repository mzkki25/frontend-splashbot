import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/splashbot-logo.png?height=40&width=40"
              alt="SPLASHBot Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold">SPLASHBot</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your AI Assistant for <span className="text-blue-600">Macroeconomics</span>
            </h2>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl">
              SPLASHBot helps you understand global and Indonesian macroeconomics through intelligent conversations.
              Upload PDFs and images for enhanced context and insights.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 container">
          <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered Conversations</h4>
              <p className="text-gray-600">
                Get accurate answers to your macroeconomics questions using advanced AI technology.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">PDF Upload</h4>
              <p className="text-gray-600">
                Upload economic reports and papers for more contextual and informed responses.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Image Analysis</h4>
              <p className="text-gray-600">Upload charts, graphs, and economic visualizations for AI interpretation.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-gray-500">
          <p>© {new Date().getFullYear()} SPLASHBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
