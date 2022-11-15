require('dotenv/config')
const express = require("express");
const session = require('express-session');
const parseurl = require('parseurl');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
inspect = require('util').inspect;
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");
const app = express();
var useragent = require('express-useragent');
var corsOptions = {
  origin: ["http://localhost:4001", "http://192.168.0.91:4001", "http://192.168.0.51:4004"]
};

global.__basedir = __dirname;

// net = require("net")

// net.createServer((socket) =>{
//   //just added
//   socket.on("error", (err) =>{
//     console.log("Caught flash policy server socket error: ")
//     console.log(err.stack)
//   })

//   socket.write("<?xml version=\"1.0\"?>\n")
//   socket.write("<!DOCTYPE cross-domain-policy SYSTEM \"http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd\">\n")
//   socket.write("<cross-domain-policy>\n")
//   socket.write("<allow-access-from domain=\"*\" to-ports=\"*\"/>\n")
//   socket.write("</cross-domain-policy>\n")
//   socket.end()
// }).listen(843)


//global.templateLink = 'http://192.168.0.107:3000/#/';
//global.cmsLink = 'http://192.168.0.107:4001/#/';
//global.providerLink = 'http://192.168.0.107:4003/#/';
//global.customerLink = 'http://192.168.0.51:4004/#/';

  // global.cmsLink = 'https://salesplanner.org/staging/cms/#/';
  // global.templateLink = 'https://salesplanner.org/staging/server/#/';
  // global.providerLink = 'https://salesplanner.org/staging/provider/#/';
  // global.customerLink = 'https://salesplanner.org/staging/customer/#/';

// global.cmsLink = 'https://salesplanner.org/cms/#/';
// global.templateLink = 'https://salesplanner.org/server/';
// global.providerLink = 'https://salesplanner.org/provider/#/';
// global.customerLink = 'https://salesplanner.org/customer/#/';

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
  
  
  // var CryptoJS = require("crypto-js");
  // const key = '9BA569F84818BE66';
  //       const keyutf = CryptoJS.enc.Utf8.parse(key);
  //       const iv = CryptoJS.enc.Base64.parse(key);
  //       const enc = CryptoJS.AES.encrypt("nskarthi@aparajayah.com", keyutf, { iv: iv });
  //       const encStr = enc.toString();

  //       console.log('encStr', encStr);

  //       const dec = CryptoJS.AES.decrypt(
  //           { ciphertext: CryptoJS.enc.Base64.parse(encStr) },
  //           keyutf,
  //           {
  //               iv: iv
  //           });
  //       const decStr = CryptoJS.enc.Utf8.stringify(dec);
        
  
  //   res.send({'encrypt':encStr,'decrypt':decStr});
//   const accountSid = 'ACe922fb7608cd5b6b2f7234d5b6a39b9b';
//   const authToken = '87529906d056da4275a697739c09fe76';

//   const notificationOpts = {
//     toBinding: [
//       '{"binding_type":"sms", "address":"+919677900736"}',
//       '{"binding_type":"sms", "address":"+919894052844"}'
//   ],
//     body: 'Knock-Knock! This is your first Notify SMS',
//   };

//   client.notify
//     .services('ISce3738d5696615d81d95648472271b2a')
//     .notifications.create(notificationOpts)
//     .then(notification => console.log(notification.sid))
//     .catch(error => console.log(error));
});
//const db = require("./app/models");
const Imports = db.imports;

const client = require('@sendgrid/client');
app.get("/sendgrid", async(req, res) => {
  const validatePhoneNumber = require('validate-phone-number-node-js');
  const result = validatePhoneNumber.validate('+9198940');
  res.send({message: result});
	// await Imports.create({type: 'lead'});
	// var dat = await Imports.find();
  // res.json({ message: dat });
	/*const mailjet = require('node-mailjet');
const request = mailjet.connect('7473a21f4fae1a2dc316430c0e790827', '3eca97359a89360fee251bde79c2e6ad')
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "moolahapp2022@gmail.com",
        "Name": "Moolah"
      },
      "To": [
        {
          "Email": "moolahapp2022@gmail.com",
          "Name": "Moolah"
        }
      ],
      "Subject": "Greetings from Mailjet.",
      "TextPart": "My first Mailjet email",
      "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })*/

	/*var set = await Api.findOne({ user: 'admin'});
	var api_key = set.noti_sendgrid_type === 'Live' ? set.noti_live_sendgrid_apikey : set.noti_sand_sendgrid_apikey;
		client.setApiKey(api_key);
		const data = {
		  "name": 'Lead List'
		};

		const request = {
		  url: `/v3/marketing/lists`,
		  method: 'POST',
		  body: data
		}
		client.request(request)
		.then(([response, body]) => {
			console.log(response.statusCode);
			console.log(response.body);
			//return response.body.id;
			res.json({ message: response.body });
		})
		.catch(error => {
			console.error(error.response.body);
		});*/
  //res.json({ message: "Welcome to server application." });
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
/*


var handlebars = require('handlebars');
var fs = require('fs');

var readHTMLFile = function(path, callback) {
	console.log(path);
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
           callback(err);
           throw err;

        }
        else {
            callback(null, html);
        }
    });
};
var transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
    auth: {
		user: 'pvcqatar2021@gmail.com',
		pass: 'mubmsashlvoucxks'
    }
});
readHTMLFile(__dirname + '/template/demo/index.html', function(err, html) {
	console.log(html);
    var template = handlebars.compile(html);
    var replacements = {
         username: "John Doe"
    };
    var htmlToSend = template(replacements);
    var mailOptions = {
        from: 'my@email.com',
        to : 'sp.karanmca@gmail.com',
        subject : 'test subject',
        html : htmlToSend
     };
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            callback(error);
        }
    else
        console.log(response);
    });
});

const mailOptions = {
    from: 'prabhakaran@aparajayah.com', // sender address
    to: 'sp.karanmca@gmail.com', // list of receivers
    subject: 'test mail', // Subject line
    html: '<h1>this is a test mail.</h1>'// plain text body
};
transporter.sendMail(mailOptions, function (err, info) {
    if(err)
        console.log(err)
    else
        console.log(info);
})
*/
// Run a "middleware" function on each request
/*app.use(function (req, res, next) {
  if (!req.session.name) {
    req.session.name = ''
  }
	req.session.name = req.session.name;
	req.session.views = req.session.views;
  next()
})*/
{/*var rp = require('request-promise');

app.get('/card',function(req,res) {
 var data = {
            CardNumber: '4242424242424242',
            ExpMonth: '05',
            ExpYear: '26'
        };
    var request = JSON.stringify(data);
    var options = {
        method: "GET",
        uri: 'https://gateway.loanpaymentpro.com/v2/customers/30b4d527-07df-48de-bd45-2cc3039bddbb/paymentcards/get',
        //body: 'CardNumber=4242424242424242&ExpMonth=15&ExpYear=26',
        headers: {
            'TransactionKey': 'cbfbd185-eef4-4205-a1f8-b446bdb0687f',
            'Content-type': 'application/x-www-form-urlencoded'
        },
        //json: true  Automatically parses the JSON string in the response
    };

    rp(options)
        .then((data)=> {
            res.send(data);
        })
    .catch((err)=> {
        console.log(err.response);
    });
    
});*/}

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

global.cmsLink = '';
global.templateLink = '';
global.tradieLink = '';
global.customerLink = '';


require("./app/routes/adminuser.routes")(app);
require("./app/routes/login.routes")(app);
require("./app/routes/setting.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/privileges.routes")(app);
require("./app/routes/columns.routes")(app);
require("./app/routes/messages.routes")(app);
require("./app/routes/emailnotification.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/state.routes")(app);
require("./app/routes/city.routes")(app);
require("./app/routes/customer.routes")(app);
require("./app/routes/enquiry.routes")(app);
require("./app/routes/suppliers.routes")(app);
require("./app/routes/categories.routes")(app);
require("./app/routes/products.routes")(app);
require("./app/routes/billingrates.routes")(app);
require("./app/routes/taxes.routes")(app);
require("./app/routes/kits.routes")(app);
require("./app/routes/purchases.routes")(app);
require("./app/routes/quotes.routes")(app);
require("./app/routes/invoices.routes")(app);
require("./app/routes/jobs.routes")(app);
require("./app/routes/connections.routes")(app);
require("./app/routes/docthemes.routes")(app);
require("./app/routes/tradie.routes")(app);
require("./app/routes/tradielogin.routes")(app);
require("./app/routes/inbox.routes")(app);

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

const general = db.settings;
  var set = general.findById('6275f6aae272a53cd6908c8d')
  .then((set)=>{
    global.cmsLink = set.cmsLink;
    global.templateLink = set.templateLink;
    global.tradieLink = set.tradieLink;
    global.customerLink = set.customerLink;
  })
  .catch((e)=>{
    return null;
  })
  