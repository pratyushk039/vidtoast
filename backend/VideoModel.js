const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename: String,
  path: String,
  size: Number,
  duration: Number,
  thumbnail: String,
  uploadedAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
