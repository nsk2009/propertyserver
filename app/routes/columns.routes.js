module.exports = app => {
const control = require("../controllers/columns.controller.js");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Create a new record
  router.post("/", control.create);

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Listed all active records
  router.get("/list", [authJwt.verifyToken], control.findList);

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

  app.use("/api/columns", router);
};
