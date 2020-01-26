//Import Modules
const multer = require('multer');
const path = require('path');


//Import Constants
const { BOOK_IMAGES_DIRECTORY, OTHER_IMAGES_DIRECTORY } = require('./config'); 


//Storage Function
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.route.path === '/api/upload/book') return cb(null, path.resolve(__dirname, BOOK_IMAGES_DIRECTORY));
        return cb(null, path.resolve(__dirname, OTHER_IMAGES_DIRECTORY));
    },

    filename: (req, file, cb) => {
        return cb(null,new Date().getTime() + path.extname(file.originalname.toLowerCase()));
    },
});


//Upload Function
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (!file.originalname.toLowerCase().match(/\.(jpe?g|png|gif)$/)) {
            return callback({
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


//Get Response function
const getResponse = function(url, message) {
    return {data: {
        url,
        message
    }}
}


//Export Functions
module.exports = {
    storage,
    upload,
    getResponse
}
