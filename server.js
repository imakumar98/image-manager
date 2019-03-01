//IMPORT MODULES
// require('dotenv').load();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

//MENTION PORT
const port = process.env.PORT || 5000;
const APP_URL = process.env.APP_URL || 'http://localhost:' + port;


const app = express();

//CORS MIDDLEWARE FOR CROSS DOMAIN REQUEST
app.use(cors());


//EXPRESS MIDDLEWARE FOR PARSING STATIC FILES
app.use('/assets',express.static(__dirname +'/assets'));

//MULTER CONFIGURATION FOR VOOK BOOK UPLOAD
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(req.route.path=='/vook/book') cb(null, 'assets/vook/books');
        else if(req.route.path=='/vook/other') cb(null,'assets/vook/other');
    },
    
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname.toLowerCase()))
       });
    }
  });
var upload = multer({
    storage: storage,
    fileFilter: function(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG)$/)){
            var errorResponse = {
                message: 'Error: Invalid file extension',
                error: true,
                success: false
            }
            return cb(errorResponse, false);
        }
        cb(null,true);
    } 
}).single('image');


  

//HOMEPAGE URL
app.get('/',(req,res)=>{
    res.send('Image manager app');
});


//UPLOAD BOOK API
app.post('/vook/book',function (req, res) {
   
    upload(req, res,(err)=> {
        if (err) res.json(err);
        var url = req.file.destination +'/'+ req.file.filename;
        sharp(url).resize(552,780).toFile('static/temp.jpg',function(err){
            if(err) return res.json(err);
            console.log(url);
            sharp('static/frame.png').overlayWith('static/temp.jpg').toFile(url,function(err,info){
                if(err) return res.json(err);
                res.json({
                    url: APP_URL +'/'+ url,
                    message: 'File uploaded successffully',
                    success: true,
                    error: false
                });
                
            })
        })
    });

    
})

//UPLOAD OTHER VOOK IMAGE
app.post('/vook/other',function (req, res) {
    upload(req, res, function (err) {
        if (err) return res.json(err);
        res.json({
            url: APP_URL +'/'+ req.file.destination +'/'+ req.file.filename,
            message: 'File uploaded successfully',
            success: true,
            error: false
        });
    });
})







//DELETE BOOK IMAGE API
app.delete('/vook/book/:id',(req,res)=>{
    var id = req.params.id;
    var file = __dirname + '/assets/vook/books/'+id;
    fs.unlink(file, (err) => {
        if (err)return res.json(err);
        res.json({message:"File deleted", success:true,error:false});
        
    });

})

app.listen(port,()=>{
    console.log(`Server started at port ${port}`);
});

