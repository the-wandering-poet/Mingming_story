"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface StoryCard {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  favorite: boolean;
}

export default function Dashboard() {
  const [stories, setStories] = useState<StoryCard[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(72)

  useEffect(() => {
    // Load stories from localStorage
    const loadStories = () => {
      try {
        const savedStories = localStorage.getItem("mingmingStories")
        if (savedStories) {
          setStories(JSON.parse(savedStories))
        } else {
          // Initialize with empty array if no stories found
          localStorage.setItem("mingmingStories", JSON.stringify([]))
          setStories([])
        }
      } catch (error) {
        console.error("Error loading stories:", error)
        setStories([])
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [])

  const handleReadStory = (storyId: string) => {
    // Find the story data in localStorage
    try {
      const savedStories = localStorage.getItem('mingmingStories')
      if (savedStories) {
        const allStories = JSON.parse(savedStories)
        const storyToRead = allStories.find((story: StoryCard) => story.id === storyId)
        
        if (storyToRead) {
          // Store the current story ID for the story page to access
          localStorage.setItem('currentStoryId', storyId)
        }
      }
    } catch (error) {
      console.error('Error preparing story for reading:', error)
    }
  }

  const handleFavoriteStory = (storyId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const savedStories = localStorage.getItem('mingmingStories')
      if (savedStories) {
        const allStories = JSON.parse(savedStories)
        const updatedStories = allStories.map((story: StoryCard) => {
          if (story.id === storyId) {
            return { ...story, favorite: !story.favorite }
          }
          return story
        })
        
        localStorage.setItem('mingmingStories', JSON.stringify(updatedStories))
        setStories(updatedStories)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDeleteStory = (storyId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this story?')) {
      try {
        const savedStories = localStorage.getItem('mingmingStories')
        if (savedStories) {
          const allStories = JSON.parse(savedStories)
          const filteredStories = allStories.filter((story: StoryCard) => story.id !== storyId)
          
          localStorage.setItem('mingmingStories', JSON.stringify(filteredStories))
          setStories(filteredStories)
        }
      } catch (error) {
        console.error('Error deleting story:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a4494]"></div>
      </div>
    )
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

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#4a4494] text-white py-4 px-6 rounded-lg mb-8 flex justify-between items-center">
            <h1 className="text-2xl md:text-2xl font-bold">My Stories</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#3a3474] px-4 py-2 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">⭐</span>
                </div>
                <span className="text-lg font-bold">{credits} Credit Left</span>
              </div>
              <Button className="bg-[#4f9cf9] hover:bg-[#3a7ac7] text-white">Buy More Credits</Button>
            </div>
          </div>
        
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't created any stories yet.</p>
            <Link href="/create">
              <Button className="bg-[#4a4494] hover:bg-[#3a3474] text-white">Create Your First Story</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={story.imageUrl || "/images/placeholder.jpg"}
                    alt={story.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#4a4494] mb-2">{story.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{new Date(story.date).toLocaleDateString()}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => handleFavoriteStory(story.id, e)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${story.favorite ? 'text-red-500' : 'text-gray-400'} hover:bg-gray-100`}
                        aria-label="Favorite story"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={story.favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={(e) => handleDeleteStory(story.id, e)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-red-500"
                        aria-label="Delete story"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <Link href={`/story?id=${story.id}`} onClick={() => handleReadStory(story.id)}>
                      <Button className="bg-[#4a4494] hover:bg-[#3a3474] text-white px-4">Read Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  )
}

