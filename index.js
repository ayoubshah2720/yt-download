import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Welcome to ytdl App.");
});

app.get("/download", async (req, res) => {
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    console.log('infoinfoinfoinfoinfoinfoinfo',info.videoDetails.thumbnails)
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    const title = info.videoDetails.title;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8 ''${encodeURIComponent(title)}.mp4`
    );
    ytdl(url, { format }).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/thumbnail", async (req, res) => {
  try {
    const url = req.query.url;
    const info = await ytdl.getInfo(url);
    res.send(info.videoDetails.thumbnails)
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
