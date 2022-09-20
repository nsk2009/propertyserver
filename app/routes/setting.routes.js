module.exports = app => {
const settings = require("../controllers/setting.controller.js");
const upload = require("../middleware/upload");
const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Retrieve a single record with id
  router.get("/:id", [authJwt.verifyToken], settings.findOne);

  // Retrieve a single record with id
  router.get("/logo/:id",  settings.findLogo);

  // Update a record with id
  router.post("/:id", upload.single("logo"), settings.update);

  // Retrieve a single record with id
  router.get("/findemailapi/:id", [authJwt.verifyToken], settings.findemailapi);

  // Update a record with id
  router.post("/updateemailapi/:id", [authJwt.verifyToken], settings.updateemailapi);

  // Retrieve a single record with id
  router.get("/findsmsapi/:id", [authJwt.verifyToken], settings.findsmsapi);

  // Update a record with id
  router.post("/updatesmsapi/:id", [authJwt.verifyToken], settings.updatesmsapi);

  // Retrieve a single record with id
  router.get("/findpaymentapi/:id", [authJwt.verifyToken], settings.findpaymentapi);

  // Update a record with id
  router.post("/updatepaymentapi/:id", [authJwt.verifyToken], settings.updatepaymentapi);
  // Update a record with id
  router.get("/findinvoice/:id", [authJwt.verifyToken], settings.findInvoice);

  app.use("/api/settings", router);
};
