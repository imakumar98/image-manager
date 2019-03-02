//IMPORT MODULES
// require('dotenv').load();

// core modules
const fs = require('fs');
const crypto = require('crypto');

// third paryt modules
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');

//MENTION PORT
const port = process.env.PORT || 5000;
const APP_URL = "https://image-manager.server.vook.in";
console.log(APP_URL);

const app = express();

//CORS MIDDLEWARE FOR CROSS DOMAIN REQUEST
app.use(cors());

//EXPRESS MIDDLEWARE FOR SERVING STATIC FILES
app.use('/assets', express.static(__dirname + '/assets'));

//MULTER CONFIGURATION FOR VOOK BOOK UPLOAD

const BOOK_DIRECTORY = 'assets/vook/books';
const OTHER_DIRECTORY = 'assets/vook/other';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.route.path === '/vook/book') return cb(null, path.resolve(__dirname, BOOK_DIRECTORY));
    return cb(null, path.resolve(__dirname, OTHER_DIRECTORY));
  },

  filename: (req, file, cb) => {
    return cb(
      null,
      new Date().getTime() + path.extname(file.originalname.toLowerCase())
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (!file.originalname.toLowerCase().match(/\.(jpe?g|png|gif)$/)) {
      return callback(
        {
          message: 'Error: Invalid file extension',
          error: true,
          success: false,
        },
        false
      );
    }
    return callback(null, true);
  },
}).single('image');

// HOMEPAGE URL
app.get('/', (req, res) => {
  res.send('Image manager app');
});

app.post('/vook/book', (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.json(err);

    const inputFile = req.file.destination + '/' + req.file.filename;
    const outputFileName = (new Date()).getTime() + req.file.filename;
    const outputFile = req.file.destination + '/' + outputFileName;

    // Image Constants
    const WIDTH = 552;
    const HEIGHT = 780;

    const PADDING_TOP = (1000 - HEIGHT) / 2;
    const PADDING_LEFT = (736 - WIDTH) / 2;
    const BG_COLOR = { r: 248, g: 248, b: 248, alpha: 1 };

    
    sharp(inputFile)
      .resize(WIDTH, HEIGHT)
      .extend({
        top: PADDING_TOP,
        bottom: PADDING_TOP,
        left: PADDING_LEFT,
        right: PADDING_LEFT,
        background: BG_COLOR,
      })
      .jpeg({
        progressive: true,
        force: false,
      })
      .png({
        force: false,
      })
      .toFile(outputFile, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        return res.json({
          url: `${APP_URL}/${BOOK_DIRECTORY}/${outputFileName}`,
          message: 'File uploaded successfully',
          success: true,
          error: false,
        });
      });
  });
});

//UPLOAD OTHER VOOK IMAGE
app.post('/vook/other', function(req, res) {
  upload(req, res, function(err) {
    if (err) return res.json(err);
    res.json({
      url: `${APP_URL}/${OTHER_DIRECTORY}/${req.file.filename}`,
      message: 'File uploaded successfully',
      success: true,
      error: false,
    });
  });
});

//DELETE BOOK IMAGE API
app.delete('/vook/book/:id', (req, res) => {
  const id = req.params.id;
  const file = path.resolve(__dirname, BOOK_DIRECTORY, id);

  fs.unlink(file, (err) => {
    if (err) return res.json(err);
    res.json({ message: 'File deleted', success: true, error: false });
  });
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
