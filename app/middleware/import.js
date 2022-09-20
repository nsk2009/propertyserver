const multer = require("multer");

var storage = multer.diskStorage({  
  destination:(req,file,cb)=>{  
    cb(null, __basedir + "/uploads/");
  },  
  filename:(req,file,cb)=>{  
  //cb(null,file.originalname);  
    cb(null, `${Date.now()}-${file.originalname}`);
  }  
  }); 
var uploadFile = multer({ storage: storage });
module.exports = uploadFile;

