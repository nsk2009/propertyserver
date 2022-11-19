module.exports = app => {
  const control = require("../controllers/quotes.controller.js");
  const { authJwt } = require("../middleware");

  var router = require("express").Router();

  // Retrieve all records
  router.get("/", [authJwt.verifyToken], control.findAll);

  // Retrieve all records
  router.get("/list", [authJwt.verifyToken], control.findList);
  
  // Generate pdf
  router.post("/pdf", control.generatePdf);

  // Retrieve all records
  router.get("/cuslist/:id", [authJwt.verifyToken], control.findCusList);

  // Retrieve all records
  router.get("/get", control.findStates);

  

  // Create a records
  router.post("/add", [authJwt.verifyToken], control.create);

  // Retrieve all trash records
  router.get("/trashall", [authJwt.verifyToken], control.trashAll);

  // Send a quote to the customer
  router.get("/sendcustomer/:id", [authJwt.verifyToken], control.sendQuoteToCustomer);

  // Approve a quote
  router.get("/approve/:id", [authJwt.verifyToken], control.approve);
  
  // Retrieve a record
  router.get("/:id", [authJwt.verifyToken], control.findOne);

  // update a records
  router.post("/:id", [authJwt.verifyToken], control.update);

  // revise a records
  router.post("/revise/:id", [authJwt.verifyToken], control.revise);

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

  app.use("/api/quotes", router);
};
