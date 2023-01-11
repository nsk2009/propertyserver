module.exports = app => {
  const control = require("../controllers/dashboard.controller.js");
  const { authJwt } = require("../middleware");
  var router = require("express").Router();

  // CMS
  router.get("/cms", [authJwt.verifyToken], control.cms);
  
  // Xero Webhooks
  router.post("/webhooks", control.webhooks);
  
  app.use("/api/dashboard", router);
};
