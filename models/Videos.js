// models/Video.js
const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', VideoSchema);
