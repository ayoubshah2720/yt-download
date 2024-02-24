import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const corsOptions = {
  origin: 'http://localhost:4200/', //Front-end url.
  credential: true,
  optionSuccessStatus: 200,
  exposedHeaders: '**',
}
app.get("/", (req, res) => {
  res.send("Welcome to ytdl App.");
});

app.get("/download", async (req, res) => {
  // how to pass parameter in url
  // http://localhost:3000/download?url=https://www.youtube.com/watch?v=D6ObIEU2UZ4
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    console.log('infoinfoinfoinfoinfoinfoinfo',info.videoDetails.thumbnails)
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    const title = info.videoDetails.title;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(title)}.mp4`
    );
    ytdl(url, { format }).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});