module.exports = app => {
  const login = require("../controllers/login.controller.js");

  var router = require("express").Router();

  // Login
  router.post("/login", login.login);

  // API Login
  router.post("/apilogin", login.apilogin);

  // Forgot
  router.post("/forgot", login.forgot);
  
  // Forgot
  router.post("/forgotpassword/:id", login.forgotpassword);
  
  // Column Settings
  router.get("/columns/:id", login.columns);

  
  app.use("/api/login", router);
};