module.exports = app => {
  const control = require("../controllers/inbox.controller.js");
  const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Sync all records to Db
  router.get("/syncmails", control.syncMails);

  // Retrieve all records
  router.get("/", control.findAll);
  
  // mark as read
  router.get("/setread/:id", control.setRead);
  
  // mark as read
  router.get("/download/:id/:pos", control.download);

  // Retrieve single record
  router.get("/:id", control.findOne);

   


  // Headers aasign
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/inbox", router);
};
