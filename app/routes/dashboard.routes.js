module.exports = app => {
  const control = require("../controllers/dashboard.controller.js");

  var router = require("express").Router();

  // CMS
  router.get("/cms", control.cms);
  
   // Xero Webhooks
  router.post("/webhooks", control.webhooks);
  
  app.use("/api/dashboard", router);
};
