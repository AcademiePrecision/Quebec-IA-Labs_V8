/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a script that generates an image and saves it to the assets folder. 
You should not use this script unless the user EXPLICITLY asks you to generate an asset.
DO NOT PROACTIVELY GENERATE ASSETS FOR THE USER.

You will need to update the prompt and the options (2nd parameter of the generateImage function) depending on your use case.
options: {
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  quality?: "low" | "medium" | "high" | "auto";
  format?: "png" | "jpeg" | "webp";
  background?: undefined | "transparent";
}

If you need to generate many assets, REFACTOR THIS SCRIPT TO CONCURRENTLY GENERATE UP TO 3 ASSETS AT A TIME. If you do not, the bash tool may time out.
use npx tsx generate-asset-script.ts to run this script.
*/

import { generateImage } from "./src/api/image-generation";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(outputPath);
  // @ts-ignore - Node.js types are not fully compatible with the fetch API
  await finished(Readable.fromWeb(response.body).pipe(fileStream));
  console.log(`Image downloaded successfully to ${outputPath}`);
}

async function logImageGeneration(prompt: string, imageUrl: string): Promise<void> {
  const logDir = path.join(__dirname, "logs");
  const logFile = path.join(logDir, "imageGenerationsLog");

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logEntry = `[${new Date().toISOString()}] Prompt: "${prompt}"\nImage URL: ${imageUrl}\n\n`;
  fs.appendFileSync(logFile, logEntry);
}

async function generateBarberImages() {
  const prompts = [
    "Professional barber using electric clippers on a client in a vintage barbershop, black and white retro photography style, dramatic lighting, high contrast, professional composition",
    "Expert barber hands carefully trimming a client's beard with scissors, black and white vintage photography, artistic focus on the skilled hand movements, retro aesthetic",
    "Satisfied client and professional barber in a classic barbershop setting, black and white retro style, warm atmosphere showing craftsmanship and customer satisfaction"
  ];

  const filenames = ["barber-clippers.png", "barber-hands.png", "barber-client.png"];

  try {
    // Generate all images concurrently
    const promises = prompts.map(async (prompt, index) => {
      console.log(`Generating image ${index + 1} with prompt:`, prompt);
      const imageUrl = await generateImage(prompt, {
        size: "1024x1024",
        quality: "high",
        format: "png",
      });

      console.log(`Image ${index + 1} generated successfully. URL:`, imageUrl);

      // Log the image generation
      await logImageGeneration(prompt, imageUrl);

      const outputPath = path.join(__dirname, "assets", filenames[index]);
      await downloadImage(imageUrl, outputPath);

      return { index: index + 1, url: imageUrl, path: outputPath };
    });

    const results = await Promise.all(promises);

    console.log("All barber images generated successfully:");
    results.forEach(result => {
      console.log(`Image ${result.index}:`);
      console.log(`  URL: ${result.url}`);
      console.log(`  Path: ${result.path}`);
    });

  } catch (error) {
    console.error("Error generating barber images:", error);
  }
}

generateBarberImages();