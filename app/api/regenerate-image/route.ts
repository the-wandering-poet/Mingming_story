import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { imagePrompt, imageStyle } = await request.json();
    
    // Ensure we have a prompt
    if (!imagePrompt) {
      return NextResponse.json({ error: 'Image prompt is required' }, { status: 400 });
    }
    
    // Prepare the final prompt with style if provided
    let finalPrompt = imagePrompt;
    if (imageStyle && !finalPrompt.toLowerCase().includes(imageStyle.toLowerCase())) {
      finalPrompt = `${imageStyle} style ${finalPrompt}`;
    }
    
    console.log(`Regenerating image with prompt:`, finalPrompt);
    
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
    
    console.log(`Replicate output for regenerated image:`, output);
    
    // Extract the image URL from the output
    const imageUrl = Array.isArray(output) && output.length > 0 ? String(output[0]) : null;
    
    if (!imageUrl) {
      console.error(`No image URL found in output:`, output);
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error regenerating image:', error);
    return NextResponse.json({ error: 'Failed to regenerate image' }, { status: 500 });
  }
}