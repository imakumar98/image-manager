//Import Depencies
const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const bodyParser = require('body-parser');


require('dotenv').config()


//Import function file
const { upload, getResponse } = require('./functions');


//Import Constants
const { APP_URL, 
        BOOK_IMAGES_DIRECTORY,
        OTHER_IMAGES_DIRECTORY,
        BOOK_OBJECT_HEIGHT,
        BOOK_OBJECT_WIDTH,
        BOOK_BACKGROUND_COLOR,
        VERTICAL_PADDING,
        HORIZONTAL_PADDING } = require('./config');


//Start App
const app = express();


//Define Static Directory(Public)
app.use('/assets', express.static(__dirname + '/assets'));

//Initialize body parser
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: false }))


//Endpoint to upload book image
app.post('/api/upload/book', (req, res) => {

  

    upload(req, res, (err) => {

      if (err) return res.status(500).json(err);
  
      //Input file path
      const inputFile = req.file.destination + '/' + req.file.filename;

      //Output Filename
      const outputFileName = (new Date()).getTime() + req.file.filename;

      //Output file path
      const outputFile = req.file.destination + '/' + outputFileName;
  
      sharp(inputFile)
      .resize(BOOK_OBJECT_WIDTH, BOOK_OBJECT_HEIGHT)
      .extend({
          top: VERTICAL_PADDING,
          bottom: VERTICAL_PADDING,
          left: HORIZONTAL_PADDING,
          right: HORIZONTAL_PADDING,
          background: BOOK_BACKGROUND_COLOR,
      })
      .jpeg({
        progressive: true,
        force: false,
      })
      .png({
        force: false,
      })
      .toFile(outputFile, (err) => {

        if (err) return res.status(500).send('Internal Server Error');
          
          const fileToDelete = './assets/vook/books/'+req.file.filename;

          fs.unlinkSync(fileToDelete);

          const response = getResponse(`${APP_URL}/${BOOK_IMAGES_DIRECTORY}/${outputFileName}`, 'Image Uploaded');

          return res.json(response);

        });
    });


});


//Endpoint to upload other images(banners, logo, promotions)
app.post('/api/upload/other', (req,res)=>{



    upload(req, res, (err) => {

      if(err) return res.status(500).json(err);
      
      const response = getResponse(`${APP_URL}/${OTHER_IMAGES_DIRECTORY}/${req.file.filename}`, 'Image Uploaded');

      return res.json(response);

    })


  

});




//App Listen
app.listen(process.env.PORT, ()=>{
  
  console.log(`Image Manager runnnig on ${process.env.PORT}`);

})