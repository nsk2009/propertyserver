const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/documents/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, limits: { fileSize: 2000000 } });
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