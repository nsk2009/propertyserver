module.exports = app => {
const control = require("../controllers/notes.controller.js");
const upload = require("../middleware/upload");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Create a new record
  //router.post("/", upload.fields([{name: "photo", maxCount: 1},{name: "photos", maxCount: 1}]), control.create);
  router.post("/", [authJwt.verifyToken], control.create);

  // Retrieve all records
  router.get("/notes/:id", [authJwt.verifyToken], control.findAll);

  // Update a record status with id
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Update a record with id
  router.post("/:id", control.update);

  // Headers aasign
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/notes", router);
};
