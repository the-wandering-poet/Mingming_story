import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#c7d1ff]">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#6c4ed9] rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full overflow-hidden">
              <Image
                src="/images/logo.png"
                width={40}
                height={40}
                alt="Mingming Story Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[#4a4494] text-2xl font-semibold">Mingming Story</span>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-[#4a4494] font-medium text-lg">
            Home
          </Link>
          <Link href="/create" className="text-[#4a4494] font-medium text-lg">
            Create Story
          </Link>
          <Link href="#" className="text-[#4a4494] font-medium text-lg">
            Explore Stories
          </Link>
          <Link href="#" className="text-[#4a4494] font-medium text-lg">
            Contact Us
          </Link>
        </nav>

        <Link href="/dashboard">
          <Button className="bg-[#4a4494] hover:bg-[#3a3474] text-white rounded-full px-6 py-2 text-base">Dashboard</Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 flex flex-col justify-center" style={{ minHeight: "calc(100vh - 88px)" }}>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 md:space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-[#4a4494] leading-tight">
              Craft Magical Stories of Mingming in Seconds
            </h1>
            <p className="text-[#4a4494] text-lg md:text-xl max-w-md">
              Create fun and personalised stories that bring Mingming&apos;s adventures to life. It only takes a few seconds!
            </p>
            <div className="pt-3">
              <Link href="/create">
                <Button className="bg-[#4a4494] hover:bg-[#3a3474] text-white rounded-full px-8 py-3 text-lg">
                  Create Story
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[280px] md:h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl">
              <div className="relative w-full h-full bg-gradient-to-br from-[#8a7ad9]/20 to-[#6c4ed9]/30">
                <Image
                  src="/images/storybook-illustration.jpg"
                  fill
                  alt="Storybook illustration of a happy Mingming"
                  className="object-cover rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

