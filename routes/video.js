// routes/video.js
const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Video = require('../models/Videos');
const { verifyTokenAndAdmin, verifytoken } = require('../middleware/auth');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Multer file filter to check for video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 600 * 1024 * 1024 }, // 100 MB file size limit
  fileFilter: fileFilter
});

// Upload a single  video (admin only)
// router.post('/upload', verifyTokenAndAdmin, upload.single('video'), async (req, res) => {
//   const newVideo = new Video({
//     title: req.body.title,
//     description: req.body.description,
//     filename: req.file.filename
//   });

//   try {
//     const savedVideo = await newVideo.save();
//     res.status(200).json({ message: 'Video uploaded successfully!', video: savedVideo });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Upload multiple videos (admin only)
router.post('/upload', verifyTokenAndAdmin, upload.array('videos', 10), async (req, res) => {
  try {
    const videos = req.files.map(file => ({
      title: req.body.title,
      description: req.body.description,
      filename: file.filename
    }));

    const savedVideos = await Video.insertMany(videos);
    res.status(200).json({ message: 'Videos uploaded successfully!', videos: savedVideos });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all uploaded videos (for logged-in users)
router.get('/', verifytoken, async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Serve a specific video
// router.get('/:id', verifytoken, async (req, res) => {
//     try {
//       const video = await Video.findById(req.params.id);
//       if (!video) {
//         return res.status(404).json({ message: 'Video not found' });
//       }
//       const filePath = path.join(__dirname, '../uploads', video.filename);
//       res.sendFile(filePath);
//     } catch (err) {
//       console.error('Error fetching video', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });


//serving video in chunks
router.get('/:id', verifytoken, async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const filePath = path.join(__dirname, '../uploads', video.filename);

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Delete a specific video by ID (admin only)
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const filePath = path.join(__dirname, '../uploads', video.filename);
    fs.unlinkSync(filePath); // Delete the video file from storage

    await Video.findByIdAndDelete(req.params.id); // Delete the video record from the database

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
