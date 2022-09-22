require('dotenv/config')
const express = require("express");
const session = require('express-session');
const parseurl = require('parseurl');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const app = express();
var useragent = require('express-useragent');
var corsOptions = {
  origin: ["http://localhost:4001", "http://192.168.0.91:4001", "http://192.168.0.51:4004"]
};

global.__basedir = __dirname;

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

app.use(useragent.express());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
  
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to server application." });
 
});

app.use(function(req, res, next) {
  req.session.useragent = {
    isMobile: req.useragent.isMobile,
    browser: req.useragent.browser,
    version: req.useragent.version,
    os: req.useragent.os,
    platform: req.useragent.platform,
    login : 'ri-login-box-line',
    logout:'ri-logout-box-line',
    profile: 'ri-image-line',
    edit:'ri-edit-box-line',
    create:'ri-file-add-fill',
    delete:'ri-delete-bin-line',
    export:'ri-upload-2-line',
    import:' ri-download-2-line',
    restore: 'ri-refresh-line',
    updateAll:'ri-file-edit-line',
    password:'ri-shield-flash-line',
    apiChange:'ri-drag-move-line',
    settings:'ri-settings-3-line',
    payment_success: 'ri-exchange-dollar-line',
    fail:'ri-thumb-down-fill',
    card:' ri-bank-card-2-line',
  }
  //console.log(JSON.stringify(req.session.useragent, null ,4))
  next();
});

app.get('/uploads/:file(*)', (req, res) => {
    let file = req.params.file;
    //console.log(file);
    if(file === 'undefined' || file === '')
      file = 'no-image.jpg';
    let fileLocation = __basedir+'/uploads/'+file;
    res.sendFile(`${fileLocation}`)
})

app.get('/template/:file(*)', (req, res) => {
    let file = req.params.file;
    //console.log(file);
    if(file === 'undefined' || file === '')
      file = 'no-image.jpg';
    let fileLocation = __basedir+'/template/'+file;
    res.sendFile(`${fileLocation}`)
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).send({ message : "Page not found!"});
});

app.post('*', function(req, res){
  res.status(404).send({ message : "Page not found!"});
});
// set port, listen for requests
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
  