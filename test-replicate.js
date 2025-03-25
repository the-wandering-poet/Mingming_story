const Replicate = require('replicate');
require('dotenv').config(); // Load environment variables

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testReplicate() {
  try {
    console.log("Testing Replicate API...");
    
    const output = await replicate.run(
      "the-wandering-poet/ming_ming:66c93dc59553eea5be184ff3ce5a4252035cca5ec7ac93eb8f7d1736a2da0f0f",
      {
        input: {
          model: "schnell",
          prompt: "Test image of MINGK the dog playing in a park",
          go_fast: false,
          lora_scale: 1,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3,
          output_quality: 80,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 4
        }
      }
    );
    
    console.log("Response type:", typeof output);
    console.log("Response structure:", JSON.stringify(output, null, 2));
    
    if (output && typeof output === 'object' && 'output' in output) {
      console.log("URL from output.output[0]:", output.output[0]);
    } else if (Array.isArray(output)) {
      console.log("Direct array output:", output);
    } else {
      console.log("Unexpected output format");
    }
  } catch (error) {
    console.error("Error testing Replicate:", error);
  }
}

testReplicate();
