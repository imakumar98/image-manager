//Import Depencies
const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');



const app = express();


//Set Static directory
app.use('/assets', express.static(__dirname + '/assets'));



//Set Book Directory
const BOOK_DIRECTORY = 'assets/vook/books';

//Set Other Images directory
const OTHER_DIRECTORY = 'assets/vook';








//Homepage Endpoint
app.get('/', (req,res)=>{
    res.send("Welcome to image manager service");

});


//Storage Function
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
  

//Upload Function
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




//Upload Book
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
          return res.json({data: {
            url: `http://localhost/${BOOK_DIRECTORY}/${outputFileName}`,
            message: 'File uploaded successfully',
            success: true,
            error: false,
          }});
        });
    });
  });



app.listen(3000, ()=>{
    console.log("App is running on 3000");
})