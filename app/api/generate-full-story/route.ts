import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Replicate from 'replicate';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { storySubject, storyType, imageStyle } = await request.json();
    
    // Step 1: Generate story content with OpenAI
    const systemPrompt = `You are a creative children's story writer specializing in stories about a dog named Mingming.
    Create a story with EXACTLY 5 panels (no more, no less):
    - Panel 1: A cover image with a title that captures the key themes. IMPORTANT: The cover image MUST prominently feature MINGK the dog as the main subject.
    - Panels 2-5: Each with an image description and a few lines of caption text
    
    The story should be age-appropriate, engaging, and follow the theme provided.
    
    Output the result as a JSON object with this structure:
    {
      "title": "Story Title",
      "panels": [
        {
          "imagePrompt": "Detailed description for cover image generation with MINGK the dog as the main subject and focal point (do not describe Mingming's appearance or species, just refer to him as MINGK)",
          "text": "Story Title"
        },
        {
          "imagePrompt": "Detailed description for panel 2 image that directly illustrates the caption text (do not describe Mingming's appearance or species, just refer to him as MINGK)",
          "text": "Caption text for panel 2"
        },
        {
          "imagePrompt": "Detailed description for panel 3 image that directly illustrates the caption text (do not describe Mingming's appearance or species, just refer to him as MINGK)",
          "text": "Caption text for panel 3"
        },
        {
          "imagePrompt": "Detailed description for panel 4 image that directly illustrates the caption text (do not describe Mingming's appearance or species, just refer to him as MINGK)",
          "text": "Caption text for panel 4"
        },
        {
          "imagePrompt": "Detailed description for panel 5 image that directly illustrates the caption text (do not describe Mingming's appearance or species, just refer to him as MINGK)",
          "text": "Caption text for panel 5"
        }
      ]
    }
    
    IMPORTANT:
    - You MUST create EXACTLY 5 panels, numbered 1 through 5
    - Each panel MUST have both an imagePrompt and text field
    - In image Prompt, refer to the dog as 'MINGK the dog'. But in caption text, refer to the dog as 'Mingming'.
    - DO NOT include markdown formatting, code blocks, or backticks in your response
    - Return ONLY the JSON object with no additional text
    
    IMPORTANT GUIDELINES FOR IMAGE PROMPTS:
    1. Always refer to the dog as "MINGK the dog" in image prompts
    2. Each image prompt MUST feature EXACTLY ONE MINGK the dog as the main subject
    3. ALWAYS ensure the image prompt directly illustrates the caption text. Make image prompts detailed and vivid, but focus on the scene and action
    4. NEVER describe what kind of dog MINGK is or any physical characteristics
    5. Start each image prompt with "${imageStyle} style"
    6. DO NOT include descriptions of MINGK the dog's families
    `;

    const enhancedUserPrompt = `Create a story about ${storySubject} in the style of ${storyType}.

    IMPORTANT GUIDELINES:
    1. Each image prompt MUST directly illustrate its corresponding caption text
    2. Each image prompt MUST feature EXACTLY ONE MINGK dog as the main subject
    3. All image prompts should start with "${imageStyle} style"
    4. DO NOT include markdown formatting, code blocks, or backticks in your response
    5. Return ONLY the JSON object with no additional text`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedUserPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // Force JSON response format
    });

    // Get the raw content from the API response
    const rawContent = completion.choices[0].message.content || "{}";
    
    // Clean up the content by removing any markdown formatting
    let cleanedContent = rawContent;
    
    // Remove markdown code blocks if present
    if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.replace(/```json\s*|\s*```/g, "");
    }
    
    // Parse the JSON response
    let storyContent;
    try {
      storyContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.log("Raw content:", rawContent);
      console.log("Cleaned content:", cleanedContent);
      throw new Error("Failed to parse story content from API response");
    }
    
    // Validate and ensure we have exactly 5 panels
    if (!storyContent.panels || !Array.isArray(storyContent.panels)) {
      storyContent.panels = [];
    }
    
    // If we have fewer than 5 panels, add placeholder panels
    while (storyContent.panels.length < 5) {
      const panelNumber = storyContent.panels.length + 1;
      storyContent.panels.push({
        imagePrompt: `${imageStyle} style MINGK the dog as the main subject in a scene for panel ${panelNumber}.`,
        text: panelNumber === 1 ? (storyContent.title || "Mingming's Adventure") : `Panel ${panelNumber}`
      });
    }
    
    // If we have more than 5 panels, trim to 5
    if (storyContent.panels.length > 5) {
      storyContent.panels = storyContent.panels.slice(0, 5);
    }
    
    // Ensure we have a title
    if (!storyContent.title) {
      storyContent.title = "Mingming's Adventure";
    }
    
    // Step 2: Generate images for each panel using Replicate directly
    const panelsWithImages = await Promise.all(
      storyContent.panels.map(async (panel: { imagePrompt: string; text: string }, index: number) => {
        try {
          // Use the panel's imagePrompt directly instead of trying to extract it from request
          let finalPrompt = panel.imagePrompt;
          
          // Ensure the style is included in the prompt if not already
          if (imageStyle && !finalPrompt.toLowerCase().includes(imageStyle.toLowerCase())) {
            finalPrompt = `${finalPrompt}, ${imageStyle} style`;
          }
          
          console.log(`Generating image ${index + 1} with prompt:`, finalPrompt);
          
          // Call the Replicate API with the fine-tuned Mingming model
          const output = await replicate.run(
            "the-wandering-poet/ming_ming:66c93dc59553eea5be184ff3ce5a4252035cca5ec7ac93eb8f7d1736a2da0f0f",
            {
              input: {
                model: "schnell",
                prompt: finalPrompt,
                num_inference_steps: 4,
                guidance_scale: 10,
                go_fast: false,
                lora_scale: 1,
                megapixels: "1",
                num_outputs: 1,
                aspect_ratio: "4:3",
                output_format: "webp",
                output_quality: 80,
                prompt_strength: 0.8,
                extra_lora_scale: 1
              }
            }
          );
          
          console.log(`Replicate output for panel ${index + 1}:`, output);
          
          // Extract the image URL from the output
          const imageUrl = Array.isArray(output) && output.length > 0 ? String(output[0]) : null;
          
          if (!imageUrl) {
            console.error(`No image URL found in output for panel ${index + 1}:`, output);
            return {
              ...panel,
              imageUrl: "/images/placeholder.jpg"
            };
          }
          
          console.log(`Successfully generated image for panel ${index + 1}:`, imageUrl);
          return {
            ...panel,
            imageUrl: imageUrl
          };
        } catch (error) {
          console.error(`Error generating image for panel ${index + 1}:`, error);
          return {
            ...panel,
            imageUrl: "/images/placeholder.jpg"
          };
        }
      })
    );
    
    // Return the complete story with images
    return NextResponse.json({
      title: storyContent.title,
      subject: storySubject,
      type: storyType,
      style: imageStyle,
      date: new Date().toISOString(),
      panels: panelsWithImages
    });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
} 