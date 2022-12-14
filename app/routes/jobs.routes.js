module.exports = app => {
  const control = require("../controllers/jobs.controller.js");
  const { authJwt } = require("../middleware");
  const upload = require("../middleware/document");

  var router = require("express").Router();

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Retrieve all records
  router.get("/list", [authJwt.verifyToken], control.findList);

  // Retrieve all records
  router.get("/get", control.findStates);

  // Retrieve all records
  router.get("/cuslist/:id", [authJwt.verifyToken], control.findCusList);

  // Delete document
  router.get("/deldocument/:id", [authJwt.verifyToken], control.deldocument);

  // Create a records
  router.post("/add", [authJwt.verifyToken], control.create);

  // Retrieve all trash records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Retrieve a record
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Update a document with id
  router.post("/document/:id", upload.single("document"), control.document);

  // Send a quote to the customer
  router.post("/sendtradie/:id", [authJwt.verifyToken], control.sendTotradie);

  // update a records
  router.post("/:id", [authJwt.verifyToken], control.update);

  // restore a records
  router.get("/restore/:id", [authJwt.verifyToken], control.restore);

  // invoice a records
  router.get("/invoice/:id", [authJwt.verifyToken], control.makeinvoice);

  // quote a records
  router.get("/quote/:id", [authJwt.verifyToken], control.quote);

  // trash a records
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Retrieve all history record with a id
  router.get("/autoload/:id", [authJwt.verifyToken], control.autoload);


  // Headers aasign
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/jobs", router);
};
