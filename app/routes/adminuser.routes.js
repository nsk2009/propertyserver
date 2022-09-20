module.exports = app => {
const control = require("../controllers/adminuser.controller.js");
const upload = require("../middleware/upload");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Create a new record
  //router.post("/", upload.fields([{name: "photo", maxCount: 1},{name: "photos", maxCount: 1}]), control.create);
  router.post("/", [authJwt.verifyToken], control.create);

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Retrieve all trash records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Update selected records
  router.get("/updateall", [authJwt.verifyToken], control.updateAll);

  // Retrieve all published records
  router.get("/exceldoc", [authJwt.verifyToken], control.exceldoc);

  // Update a record status with id
  router.get("/trash/:id", [authJwt.verifyToken], control.trash);

  // Restore a record status with id
  router.get("/restore/:id", [authJwt.verifyToken], control.restore);

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // Change Login with id
  router.get("/handlelogin/:id", [authJwt.verifyToken], control.handleLogin);

  // Change Login with id
  router.get("/setpass/:id", [authJwt.verifyToken], control.setPass);

  // Change Login with id
  router.get("/activity/:id", control.activity);

  // Update a record with id
  router.post("/:id", [authJwt.verifyToken], control.update);

  // Update a profile with id
  router.post("/profile/:id", [authJwt.verifyToken], control.profile);

  // Create Password
  router.post("/createpassword/:id", control.createpassword);

  // Change password with id
  router.post("/changepassword/:id", [authJwt.verifyToken], control.changepassword);

  // Update a record with id
  router.post("/profilepic/:id", upload.single("profilepic"), control.profilepic);

  // Update a columns with id
  router.post("/columns/:id", control.updateColumns);

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

  app.use("/api/adminusers", router);
};
