require('dotenv/config')
const express = require("express");
const session = require('express-session');
const parseurl = require('parseurl');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
inspect = require('util').inspect; 
const bodyParser = require('body-parser')
const crypto = require('crypto')
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
const Api = db.emailapi;
//console.log(db.url);
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
app.get("/pdf", (req, res) => {
	const puppeteer = require('puppeteer');

	(async () => {
	  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: [ '--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote' ] });
	  const page = await browser.newPage();
	  /*await page.goto('https://news.ycombinator.com', {
		waitUntil: 'networkidle2',
	  });*/
	  await page.setContent('Test PDF', { waitUntil: ['domcontentloaded', 'networkidle2'] });
	  // page.pdf() is currently supported only in headless mode.
	  // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
	  await page.pdf({
		path: './quotes/hn.pdf',
		format: 'letter',
	  });

	  await browser.close();
	})();
  res.json({ message: "PDF Generated" });  
});

//User Agent
//const useragent = require('express-useragent');
//app.use(useragent.express());
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

app.get('/inbox/:file(*)', (req, res) => {
    let file = req.params.file;
    //console.log(file);
    if(file === 'undefined' || file === '')
      file = 'no-image.jpg';
    let fileLocation = __basedir+'/inbox/'+file;
    res.sendFile(`${fileLocation}`)
});

app.get('/invoices/:file(*)', (req, res) => {
  let file = req.params.file;
  //console.log(file);
  if(file === 'undefined' || file === '')
    file = 'no-image.jpg';
  let fileLocation = __basedir+'/invoices/'+file;
  res.sendFile(`${fileLocation}`)
});

app.get('/quotes/:file(*)', (req, res) => {
  let file = req.params.file;
  //console.log(file);
  if(file === 'undefined' || file === '')
    file = 'no-image.jpg';
  let fileLocation = __basedir+'/quotes/'+file;
  res.sendFile(`${fileLocation}`)
});

app.get('/documents/:file(*)', (req, res) => {
  let file = req.params.file;
  //console.log(file);
  if(file === 'undefined' || file === '')
    file = 'no-image.jpg';
  let fileLocation = __basedir+'/documents/'+file;
  res.sendFile(`${fileLocation}`)
});

global.cmsLink = '';
global.templateLink = '';
global.tradieLink = '';
global.customerLink = '';
global.chromium = '';


require("./app/routes/adminuser.routes")(app);
require("./app/routes/login.routes")(app);
require("./app/routes/setting.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/privileges.routes")(app);
require("./app/routes/columns.routes")(app);
require("./app/routes/messages.routes")(app);
require("./app/routes/emailnotification.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/customer.routes")(app);
require("./app/routes/agent.routes")(app);
require("./app/routes/enquiry.routes")(app);
require("./app/routes/taxes.routes")(app);
require("./app/routes/banks.routes")(app);
require("./app/routes/quotes.routes")(app);
require("./app/routes/invoices.routes")(app);
require("./app/routes/jobs.routes")(app);
require("./app/routes/tradie.routes")(app);
require("./app/routes/tradielogin.routes")(app);
require("./app/routes/inbox.routes")(app);
require("./app/routes/notes.routes")(app);
require("./app/routes/mailbox.routes")(app);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).send({ message : "Page not found!"});
});

app.post('*', function(req, res){
  res.status(404).send({ message : "Page not found!"});
});
// set port, listen for requests
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const general = db.settings;
  var set = general.findById('6275f6aae272a53cd6908c8d')
  .then((set)=>{
    global.cmsLink = set.cmsLink;
    global.templateLink = set.templateLink;
    global.tradieLink = set.tradieLink;
    global.customerLink = set.customerLink;
    global.chromium = JSON.parse(set.browser); 
  })
  .catch((e)=>{
    return null;
  })
  