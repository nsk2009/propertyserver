module.exports = app => {
  const control = require("../controllers/invoices.controller.js");
  const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Retrieve all records
  router.get("/list", [authJwt.verifyToken], control.findList);

  // Retrieve all records
  router.get("/get", control.findStates);

  // Create a records
  router.post("/add", [authJwt.verifyToken], control.create);

  // Retrieve all trash records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Send a quote to the customer
  router.post("/sendcustomer/:id", [authJwt.verifyToken], control.sendToCustomer);

  // Send a quote to the customer
  router.post("/payment/:id", [authJwt.verifyToken], control.payment);

  // remove payment
  router.get("/removepayment/:id/:pay", [authJwt.verifyToken], control.removepayment);

  // Retrieve a record
  router.get("/details/:id", [authJwt.verifyToken], control.details);

  // Retrieve a record
  router.get("/job/:id", [authJwt.verifyToken], control.job);

  // Retrieve a record
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // update a records
  router.post("/:id", [authJwt.verifyToken], control.update);

  // trash a records
  router.get("/restore/:id", [authJwt.verifyToken], control.restore);

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

  app.use("/api/invoices", router);
};
