
import fs from 'fs'
import path from 'path'
import youtubedl from 'youtube-dl-exec'

async function downloadYouTubeVideo(videoUrl, outputPath) {
  try {
    console.log('Starting download...');
    
    // Get video info
    const videoInfo = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });
    
    const videoTitle = videoInfo.title.replace(/[^\w\s]/gi, '');
    const fileName = `${videoTitle}.mp4`;
    const filePath = path.join(outputPath, fileName);
    
    console.log(`Downloading: ${videoInfo.title}`);
    
    // Download video
    await youtubedl(videoUrl, {
      output: filePath,
      format: 'bestvideo+bestaudio/best', // This selects the best quality video with audio
      mergeOutputFormat: 'mp4', // This ensures the output is merged into a single MP4 file
    });
    
    // Check file size
    const stats = fs.statSync(filePath);
    console.log(`Download complete: ${fileName}`);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage
const videoUrl = 'https://www.youtube.com/watch?v=ipctYMf87nE';
const outputPath = './downloads';

// Ensure the output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

downloadYouTubeVideo(videoUrl, outputPath);