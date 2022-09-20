const multer = require("multer");
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //return cb("Please upload only images.", false);
    return cb(JSON.stringify({ "success": false, "message": "Please upload only images" }), false);
  }
};
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, fileFilter: imageFilter, limits: { fileSize: 2000000 } });
module.exports = uploadFile;
/*
const storage = multer.diskStorage({
        destination: (req, file, cb) => {
           if (file.fieldname === "profile") {
               cb(null, './uploads/profiles/')
           }
           else if (file.fieldname === "natid") {
               cb(null, './uploads/ids/');
           }
           else if (file.fieldname === "certificate") {
               cb(null, './uploads/certificates/')
           }
        },
        filename:(req,file,cb)=>{
            if (file.fieldname === "profile") {
                cb(null, file.fieldname+Date.now()+path.extname(file.originalname));
            }
          else if (file.fieldname === "natid") {
            cb(null, file.fieldname+Date.now()+path.extname(file.originalname));
          }
          else if (file.fieldname === "certificate") {
            cb(null, file.fieldname+Date.now()+path.extname(file.originalname));
          }
        }
    });
	*/