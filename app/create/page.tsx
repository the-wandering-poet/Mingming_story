"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { v4 as uuidv4 } from 'uuid'

export default function CreateStory() {
  const router = useRouter()
  const [storySubject, setStorySubject] = useState("")
  const [storyType, setStoryType] = useState("adventure")
  const [imageStyle, setImageStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("") // Used to display error messages to the user

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!storySubject || !storyType || !imageStyle) {
      alert("Please fill in all fields")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // Call our API to generate the full story
      const response = await fetch('/api/generate-full-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storySubject,
          storyType,
          imageStyle,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate story')
      }

      const data = await response.json()
      
      // Generate a unique ID for the story
      const storyId = uuidv4()
      
      // Create a complete story object with ID
      const storyData = {
        id: storyId,
        title: data.title,
        subject: storySubject,
        type: storyType,
        style: imageStyle,
        date: new Date().toISOString(),
        panels: data.panels
      }
      
      // Save as current story for immediate viewing
      localStorage.setItem("currentStory", JSON.stringify(storyData))
      
      // Get existing stories or initialize empty array
      const existingStories = JSON.parse(localStorage.getItem("mingmingStories") || "[]")
      
      // Add new story to the array
      existingStories.push({
        id: storyId,
        title: data.title,
        imageUrl: data.panels[0]?.imageUrl || "/images/placeholder.jpg",
        date: new Date().toISOString()
      })
      
      // Save updated stories array
      localStorage.setItem("mingmingStories", JSON.stringify(existingStories))
      
      // Navigate to the story page with the ID
      router.push(`/story?id=${storyId}`)
    } catch (error) {
      console.error('Error generating story:', error)
      setError('Failed to generate story. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

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

      <main className="container mx-auto px-4 py-4 md:py-6">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#4a4494]">1. Story Idea</h2>
              <Textarea
                value={storySubject}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStorySubject(e.target.value)}
                placeholder="Enter your story idea here..."
                className="min-h-[160px] bg-white border-0 rounded-lg shadow-sm"
                required
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#4a4494]">2. Story Type</h2>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { name: "Adventure", path: "/images/adventure.jpg" },
                  { name: "Family fun", path: "/images/family-fun.jpg" },
                  { name: "Educational", path: "/images/educational.jpg" }
                ].map((type) => (
                  <div
                    key={type.name}
                    onClick={() => setStoryType(type.name.toLowerCase())}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden h-40 ${
                      storyType === type.name.toLowerCase() ? "ring-4 ring-[#6c4ed9]" : ""
                    }`}
                  >
                    <Image 
                      src={type.path} 
                      alt={type.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${type.path}`);
                        e.currentTarget.src = "/placeholder.svg?height=200&width=150";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                      <span className="text-white font-medium">{type.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#4a4494]">3. Image Style</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "Realistic", path: "/images/realistic.jpg" },
                  { name: "3D Cartoon", path: "/images/3d-cartoon.jpg" },
                  { name: "Water Color", path: "/images/water-color.jpg" }
                ].map((style) => (
                  <div
                    key={style.name}
                    onClick={() => setImageStyle(style.name.toLowerCase())}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden h-32 ${
                      imageStyle === style.name.toLowerCase() ? "ring-4 ring-[#6c4ed9]" : ""
                    }`}
                  >
                    <Image 
                      src={style.path} 
                      alt={style.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${style.path}`);
                        e.currentTarget.src = "/placeholder.svg?height=150&width=150";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                      <span className="text-white font-medium">{style.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 mb-4">
            <Button
              type="submit"
              className="bg-[#4a4494] hover:bg-[#3a3474] text-white rounded-full px-8 py-3 text-lg"
              disabled={isGenerating}
            >
              {isGenerating ? "Creating..." : "Create Story"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

