"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, RefreshCw } from "lucide-react"

export default function StoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storyId = searchParams.get('id')
  
  const [storyData, setStoryData] = useState<{
    id?: string;
    subject?: string;
    type?: string;
    style?: string;
    date?: string;
    panels?: {
      imagePrompt: string;
      text: string;
      imageUrl?: string;
    }[];
    title?: string;
  } | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [regeneratingImage, setRegeneratingImage] = useState<number | null>(null)

  useEffect(() => {
    const loadStoryData = () => {
      try {
        // First try to load from the URL parameter
        if (storyId) {
          // Try to find the full story data
          const currentStory = localStorage.getItem("currentStory")
          if (currentStory) {
            const parsedStory = JSON.parse(currentStory)
            if (parsedStory.id === storyId) {
              setStoryData(parsedStory)
              setLoading(false)
              return
            }
          }
          
          // If not found or ID doesn't match, check mingmingStories
          const savedStories = localStorage.getItem('mingmingStories')
          if (savedStories) {
            const allStories = JSON.parse(savedStories)
            const foundStory = allStories.find((story: any) => story.id === storyId)
            
            if (foundStory) {
              setStoryData(foundStory)
              setLoading(false)
              return
            }
          }
        }
        
        // If no story ID or story not found, try loading from currentStory
        const currentStory = localStorage.getItem('currentStory')
        if (currentStory) {
          setStoryData(JSON.parse(currentStory))
        } else {
          // If no story data is found, redirect to dashboard
          router.push('/dashboard')
        }
      } catch (error) {
        console.error("Failed to load story data:", error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadStoryData()
  }, [router, storyId])

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const nextPage = () => {
    if (storyData?.panels && currentPage < Math.ceil((storyData.panels.length - 1) / 2)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleRegenerateImage = async (panelIndex: number) => {
    if (!storyData?.panels?.[panelIndex] || !storyData.style) return;
    
    try {
      setRegeneratingImage(panelIndex);
      
      const response = await fetch('/api/regenerate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagePrompt: storyData.panels[panelIndex].imagePrompt,
          imageStyle: storyData.style
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate image');
      }
      
      const data = await response.json();
      
      if (data.imageUrl) {
        // Update the story data with the new image URL
        const updatedPanels = [...storyData.panels];
        updatedPanels[panelIndex] = {
          ...updatedPanels[panelIndex],
          imageUrl: data.imageUrl
        };
        
        const updatedStoryData = {
          ...storyData,
          panels: updatedPanels
        };
        
        // Update state
        setStoryData(updatedStoryData);
        
        // Update in localStorage
        localStorage.setItem('currentStory', JSON.stringify(updatedStoryData));
        
        // If this is the story with the current ID, update it in the stories list too
        if (storyId) {
          const savedStories = localStorage.getItem('mingmingStories');
          if (savedStories) {
            const allStories = JSON.parse(savedStories);
            const storyIndex = allStories.findIndex((s: {id: string}) => s.id === storyId);
            
            if (storyIndex !== -1 && panelIndex === 0) {
              // If this is the cover image, update the thumbnail in the stories list
              allStories[storyIndex].imageUrl = data.imageUrl;
              localStorage.setItem('mingmingStories', JSON.stringify(allStories));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
    } finally {
      setRegeneratingImage(null);
    }
  };

  if (loading || !storyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

      <main className="container mx-auto py-2 px-4">
               
        {/* Story content with reduced size */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {currentPage === 0 ? (
            // Cover page
            <div className="relative bg-black rounded-b-lg overflow-hidden">
              <div className="max-h-[400px] overflow-hidden relative">
                <Image
                  src={storyData?.panels?.[0]?.imageUrl || "/images/placeholder.jpg"}
                  width={400}
                  height={300}
                  alt={storyData?.panels?.[0]?.text || "Story image"}
                  className="w-full h-auto object-contain mx-auto"
                />
                
                {/* Refresh button */}
                <button 
                  onClick={() => handleRegenerateImage(0)}
                  disabled={regeneratingImage === 0}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                  aria-label="Regenerate image"
                >
                  <RefreshCw 
                    className={`h-5 w-5 text-[#4a4494] ${regeneratingImage === 0 ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-[#4a4494] bg-opacity-80 p-6">
                <h2 className="text-white text-2xl font-bold">
                  {storyData.title}
                </h2>
              </div>
            </div>
          ) : (
            // Story pages with two panels each
            <div className="bg-white rounded-b-lg overflow-hidden p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* First panel on this page */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 relative">
                    <div className="max-h-[300px] overflow-hidden relative">
                      <Image
                        src={storyData.panels?.[currentPage * 2 - 1]?.imageUrl || "/images/placeholder.jpg"}
                        width={300}
                        height={225}
                        alt={storyData.panels?.[currentPage * 2 - 1]?.text || "Story image"}
                        className="w-full h-auto object-contain mx-auto"
                      />
                      
                      {/* Refresh button */}
                      <button 
                        onClick={() => handleRegenerateImage(currentPage * 2 - 1)}
                        disabled={regeneratingImage === (currentPage * 2 - 1)}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        aria-label="Regenerate image"
                      >
                        <RefreshCw 
                          className={`h-5 w-5 text-[#4a4494] ${regeneratingImage === (currentPage * 2 - 1) ? 'animate-spin' : ''}`} 
                        />
                      </button>
                    </div>
                    <p className="text-gray-700 mt-4">{storyData.panels?.[currentPage * 2 - 1]?.text || ""}</p>
                  </div>
                </div>
                
                {/* Second panel on this page (if available) */}
                {storyData.panels?.[currentPage * 2] && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 relative">
                      <div className="max-h-[300px] overflow-hidden relative">
                        <Image
                          src={storyData.panels?.[currentPage * 2]?.imageUrl || "/images/placeholder.jpg"}
                          width={300}
                          height={225}
                          alt={storyData.panels?.[currentPage * 2]?.text || "Story image"}
                          className="w-full h-auto object-contain mx-auto"
                        />
                        
                        {/* Refresh button */}
                        <button 
                          onClick={() => handleRegenerateImage(currentPage * 2)}
                          disabled={regeneratingImage === (currentPage * 2)}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                          aria-label="Regenerate image"
                        >
                          <RefreshCw 
                            className={`h-5 w-5 text-[#4a4494] ${regeneratingImage === (currentPage * 2) ? 'animate-spin' : ''}`} 
                          />
                        </button>
                      </div>
                      <p className="text-gray-700 mt-4">{storyData.panels?.[currentPage * 2]?.text || ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons - Always visible */}
          <div className="flex justify-between p-4 bg-gray-50 border-t">
            <button
              onClick={prevPage}
              className={`rounded-full p-3 ${currentPage > 0 ? 'bg-[#4a4494] hover:bg-[#3a3474] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <span className="self-center text-gray-500">
              Page {currentPage + 1} of {Math.ceil((storyData.panels?.length || 0) / 2)}
            </span>

            <button
              onClick={nextPage}
              className={`rounded-full p-3 ${currentPage < Math.ceil(((storyData.panels?.length || 0) - 1) / 2) ? 'bg-[#4a4494] hover:bg-[#3a3474] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={currentPage >= Math.ceil(((storyData.panels?.length || 0) - 1) / 2)}
              aria-label="Next page"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

