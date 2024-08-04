const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const getVideoInfo = require('get-video-info');
const ffmpeg = require('fluent-ffmpeg');
const mongoose = require('mongoose');
const app = express();
const port = 8000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/videoDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for video metadata
const videoSchema = new mongoose.Schema({
    filename: String,
    path: String,
    size: Number,
    duration: Number,
    thumbnail: String,
    uploadDate: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', videoSchema);

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.any(), async (req, res) => {
    const videoFile = req.files[0];
    console.log(videoFile);
    if (!videoFile) {
        console.log('hey');
        return res.status(400).send('No file uploaded.');
    }

    const videoPath = path.join(__dirname, 'uploads', videoFile.filename);
    const thumbnailPath = path.join(__dirname, 'uploads', 'thumbnails', `${videoFile.filename}.png`);

    // Generate a thumbnail
    ffmpeg(videoPath)
        .on('end', () => {
            console.log('Thumbnail created');
        })
        .on('error', (err) => {
            console.error('Error creating thumbnail', err);
        })
        .screenshot({
            count: 1,
            folder: path.join(__dirname, 'uploads', 'thumbnails'),
            filename: `${videoFile.filename}.png`,
            size: '320x240',
        });

    const videoInfo = await getVideoInfo(videoPath);

    // Create and save metadata in MongoDB
    const metadata = new Video({
        filename: videoFile.filename,
        path: videoPath,
        size: videoFile.size,
        duration: videoInfo.duration,
        thumbnail: `uploads/thumbnails/${videoFile.filename}.png`,
    });
    await metadata.save();

    res.send('File uploaded successfully.');
});

app.get('/video', (req, res) => {
    // const range = req.headers.range;
    // if (!range) {
    //     return res.status(400).send("Requires Range header");
    // }
    const range = "10";

    const videoPath = "C:\\Users\\praty\\Desktop\\quick\\vidtoast\\uploads\\video.mp4";
    const videoSize = fs.statSync(videoPath).size;
    console.log(videoSize)
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
    // console.log('hey')
    // return res.json(videoSize)

});

app.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ uploadDate: -1 }).limit(4);
        res.json(videos);
    } catch (error) {
        res.status(500).send('Error fetching videos');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
