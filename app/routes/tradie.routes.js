module.exports = app => {
  // const login = require("../controllers/customer.login.controller.js");
  const control = require("../controllers/tradie.controller.js");
  const { authJwt } = require("../middleware");
  const upload = require("../middleware/upload");
  var router = require("express").Router();
  //router.post("/", upload.fields([{name: "photo", maxCount: 1},{name: "photos", maxCount: 1}]), control.create);
  router.post("/",upload.fields([{name:"bcertificate",maxCount:1},{name:"lcertificate",maxCount:1}]), control.create);

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Retrieve list records
  router.get("/list", [authJwt.verifyToken], control.findList);

  // Retrieve all trash records
  //router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Update selected records
  router.get("/updateall", [authJwt.verifyToken], control.updateAll);
  
  // Retrieve all published records
  router.get("/exceldoc", [authJwt.verifyToken], control.exceldoc);

  // Update a record status with id
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Restore a record status with id
  router.get("/restore/:id", [authJwt.verifyToken], control.restore);

  // Mogin set for tradie with id
  router.post("/morgin/:id", [authJwt.verifyToken], control.morgin);

  // Retrieve all history record with a id
  router.get("/details/:id", [authJwt.verifyToken], control.details);

  // Retrieve all history record with a id
  router.get("/history/:id", [authJwt.verifyToken], control.findAllHistory);

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Update a record with id
  router.post("/:id",upload.fields([{name:"bcertificate",maxCount:1},{name:"lcertificate",maxCount:1}]), control.update);

  // Update a columns with id
  router.post("/columns/:id", control.updateColumns);

  // Delete a record with id
  router.delete("/:id", [authJwt.verifyToken], control.delete);

  // Delete more than one record
  router.delete("/", [authJwt.verifyToken], control.deleteAll);
  
  // Change Login with id
  router.get("/sendkey/:id", [authJwt.verifyToken], control.sendKey);

  // Create Password
  router.post("/createpassword/:id", control.createpassword);

  // Headers aasign
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api/tradie", router);
};
