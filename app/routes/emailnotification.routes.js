module.exports = app => {
const control = require("../controllers/emailnotification.controller.js");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Create a new record
  router.post("/", [authJwt.verifyToken], control.create);

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Update a record status with id
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Preview Campiagn with id
  router.get("/Previewcampaign/:id", [authJwt.verifyToken], control.PreviewCampaign);

  // Retrieve all records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);
  
// Restore a record status with id
router.get("/restore/:id", [authJwt.verifyToken], control.restore);

  // Listed all active records
  router.get("/list", [authJwt.verifyToken], control.findList);

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Update a record with id
  router.post("/:id", [authJwt.verifyToken], control.update);

  // Delete a record with id
  router.delete("/:id", [authJwt.verifyToken], control.delete);

  // Headers aasign
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/emailnotification", router);
};
