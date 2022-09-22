module.exports = app => {
  const control = require("../controllers/categories.controller.js");
  const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Retrieve all records
  router.get("/", control.findAll);

  // Create a records
  router.post("/add", [authJwt.verifyToken], control.create);

   // Retrieve all categories records specific state
   router.get("/list", [authJwt.verifyToken], control.findList);

  // Retrieve a record
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // update a records
  router.post("/:id", [authJwt.verifyToken], control.update);

 

  // Retrieve active records
  router.get("/get/:id", [authJwt.verifyToken], control.findCities);

  // trash a records
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);


  // Headers aasign
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/categories", router);
};
