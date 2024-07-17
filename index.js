import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";
import fs from 'fs-extra';
import path from "path";
import cluster from 'cluster'
import http from 'http'
import { cpus } from 'os';

const numCPUs = cpus().length;

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers equal to the number of CPU cores
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // Listen for exit event and fork a new worker if one exits
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });

//  } else {

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public'));

// const corsOptions = {
//   origin: 'http://localhost:4200/', //Front-end url.
//   credential: true,
//   optionSuccessStatus: 200,
//   exposedHeaders: '**',
// }
// app.get("/", (req, res) => {
//   res.send("Welcome to ytdl App.");
// });
app.get('/', (req, res) => {
  res.render('index');
});

// app.get("/download", async (req, res) => {
//   // how to pass parameter in url
//   // http://localhost:3000/download?url=https://www.youtube.com/watch?v=D6ObIEU2UZ4
//   try {
//     const url = req.query.url;
//     const videoQuality = req.query.type || '360p';
//     const info = await ytdl.getInfo(url);
//     // console.log('qualityqualityqualityquality',req.query);
//     // console.log('infoinfoinfoinfoinfoinfoinfo',info.formats);
//     const format = ytdl.chooseFormat(info.formats, { quality: videoQuality });
//     const title = info.videoDetails.title;

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${encodeURIComponent(title)}.mp4`
//     );
//     ytdl(url, { format }).pipe(res);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error.message);
//   }
// });

app.get('/download', async (req, res) => {
  const url = req.query.url;
  const quality = req.query.quality;

  if (!quality) {
      try {
          const info = await ytdl.getInfo(url);
          const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
          res.render('download', { formats, url });
      } catch (error) {
          res.status(400).send('Invalid URL');
      }
  } else {
      res.header('Content-Disposition', 'attachment; filename="video.mp4"');
      ytdl(url, { filter: format => format.itag === parseInt(quality) })
        .on('error', (error) => {
          console.error('Error during download:', error);
          res.status(500).send('Error downloading video');
        })
        .pipe(res);
  }
});

// app.get('/download', async (req, res) => {
//   const url = req.query.url;
//   const quality = req.query.quality;

//   if (!quality) {
//       try {
//           const info = await ytdl.getInfo(url);
//           const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
//           res.render('download', { formats, url });
//       } catch (error) {
//           res.status(400).send('Invalid URL');
//       }
//   } else {
//       try {
//           const filePath = path.resolve(__dirname, 'downloads', `video-${quality}.mp4`);
//           await fs.ensureDir(path.dirname(filePath));
          
//           // Check if the file already exists
//           if (!await fs.pathExists(filePath)) {
//               const stream = ytdl(url, { filter: format => format.itag === parseInt(quality) })
//                   .pipe(fs.createWriteStream(filePath));

//               stream.on('finish', () => {
//                   res.download(filePath, 'video.mp4', async (err) => {
//                       if (err) {
//                           console.error(err);
//                       }
//                       // Optionally delete the file after download
//                       await fs.remove(filePath);
//                   });
//               });
//           } else {
//               res.download(filePath, 'video.mp4', async (err) => {
//                   if (err) {
//                       console.error(err);
//                   }
//                   // Optionally delete the file after download
//                   await fs.remove(filePath);
//               });
//           }
//       } catch (error) {
//           res.status(500).send('Error downloading video');
//       }
//   }
// });

app.get('/getVideoInfo', async (req, res) => {
  const videoURL = req.query.url;

  if (!videoURL) {
      return res.status(400).send('URL parameter is required');
  }

  try {
      const info = await ytdl.getInfo(videoURL);
      const formats = ytdl.filterFormats(info.formats, 'video');

      res.json({
          title: info.videoDetails.title,
          formats: formats.map(format => ({
              quality: format.qualityLabel,
              url: format.url
          }))
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching video info');
  }
});

app.get("/thumbnail", async (req, res) => {
  // how to pass parameter in url
  // http://localhost:3000/thumbnail?url=https://www.youtube.com/watch?v=D6ObIEU2UZ4
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    res.send(info.videoDetails.thumbnails)
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/videos", async (req, res) => {
  // how to pass parameter in url
  // http://localhost:3000/videos?url=https://www.youtube.com/watch?v=D6ObIEU2UZ4
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    res.send(info.formats)
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});


app.get("/audio", async (req, res) => {
  // how to pass parameter in url
  // http://localhost:3000/download?url=https://www.youtube.com/watch?v=D6ObIEU2UZ4
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    audioFormats.map((item)=>{
      res.send(item.url)
    })
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/allVideos", async (req,res)=>{
  try {
    // Fetch video information
    const url = req.query.url;
    const info = await ytdl.getInfo(url);

    // Extract thumbnail URL
    const thumbnails = info.videoDetails.thumbnails;

    // Extract available formats
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    formats.forEach(format => {
      console.log(`${format.qualityLabel}: ${format.url}`);
    });
    
    // Display the first image thumbnail
    // console.log('First Image Thumbnail URL:', info.videoDetails.thumbnails);
    
    // formats = [...formats, ...thumbnails]
    console.log('Available Qualities:',formats);
    // res.send(formats)
} catch (error) {
    console.error('Error fetching video information:', error);
}
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// }
