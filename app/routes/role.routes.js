module.exports = app => {
const control = require("../controllers/role.controller.js");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Create a new record
  router.post("/", control.create);

  // Retrieve all records
  router.get("/", control.findAll);

  // Retrieve all trash records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Update selected records
  router.get("/updateall", [authJwt.verifyToken], control.updateAll);

  // Export excel all records
  router.get("/exceldoc", [authJwt.verifyToken], control.exceldoc);

  // Listed all active records
  router.get("/list", control.findList);

  // Update a record status with id
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Restore a record status with id
  router.get("/restore/:id", [authJwt.verifyToken], control.restore);

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Update a record with id
  router.post("/:id", control.update);

  // Delete a record with id
  router.delete("/:id", [authJwt.verifyToken], control.delete);

  // Delete more than one record
  router.delete("/", [authJwt.verifyToken], control.deleteAll);

  // Headers aasign
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/roles", router);
};
