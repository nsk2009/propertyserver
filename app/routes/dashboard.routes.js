module.exports = app => {
  const control = require("../controllers/dashboard.controller.js");

  var router = require("express").Router();

  // CMS
  router.get("/cms", control.cms);
  
  app.use("/api/dashboard", router);
};
