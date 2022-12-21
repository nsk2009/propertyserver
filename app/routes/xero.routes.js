module.exports = xeroapp => {
	
const bodyParser = require('body-parser')
  const control = require("../controllers/dashboard.controller.js");
// Replace with your Xero Webhook Key
const xero_webhook_key = '7RNtBalk+ZQmdzZMblrFt/6y1cRBPfWcuEPg4s9U18AvyAOOqXsCi0VRSuIusbAITG0IIFWfgleKYC4LU7/x2A=='
 
// Set the body parser options
var options = {
  type: 'application/json'
};

// Using the options above, create a bodyParser middleware that returns raw responses.
var itrBodyParser = bodyParser.raw(options)
   // Xero Webhooks
  xeroapp.post("/api/dashboard/webhooks", itrBodyParser, control.webhooks);
};
