const config = require("../config/auth.config");
const crypto = require('crypto')
const db = require("../models");
const Paymentapi = db.accountingapis;
const xero = require("../middleware/xero");
const Customers = db.customer;
const Invoices= db.invoices;;
const Agents = db.agent;
const Setting = db.settings;
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
// cms
exports.cms = async (req, res) => {
	await res.send({});
};

// cms
exports.webhooks = async (req, res) => {
	// Replace with your Xero Webhook Key
	var set = await Paymentapi.findOne({ user: 'admin'});
	const xero_webhook_key = set.loan_type==="Live" ? set.live_xero_key : set.sand_xero_key;
	//'7RNtBalk+ZQmdzZMblrFt/6y1cRBPfWcuEPg4s9U18AvyAOOqXsCi0VRSuIusbAITG0IIFWfgleKYC4LU7/x2A=='
	//console.log("Body: "+req.body.toString())
	var body = JSON.parse(req.body.toString()).events;
	//console.log(body);	
	for(const e of body){
		console.log(e);
		if(e.eventCategory==="CONTACT"){
			var contact = await xero.getContact(e.resourceId);
			console.log(contact);
			var payload={};
			payload.xero=contact.contactID;
			payload.name=contact.name;
			payload.firstname=contact.firstName;
			payload.lastname=contact.lastName;
			payload.email=contact.emailAddress;
			var phone= (contact.phones.filter(element => {
			// 👇️ using AND (&&) operator
				return element.phoneType === "MOBILE";
				}));
				payload.phone= phone[0].phoneNumber;
			console.log(payload);
			var exist = await Customers.findOne({xero:contact.contactID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
			if(exist){
			var update = await Customers.findByIdAndUpdate(exist._id, payload, {useFindAndModify:false}).then((res)=>{return res;}).catch((e)=>{return e;});	
		}
			else{
				var existAgent = await Agents.findOne({xero:contact.contactID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
				if(existAgent){
					var update = await Agents.findByIdAndUpdate(existAgent._id, payload, {useFindAndModify:false}).then((res)=>{return res;}).catch((e)=>{return e;});
				}else{
				var set = await Setting.findById(settings_id).then();
				var Autoid = sprintf('%01d', set.customer);
				payload.uid="CID"+Autoid; 
			var update = await Customers.create(payload).then((res)=>{return res;}).catch((e)=>{return e;});	
			await Setting.findByIdAndUpdate(settings_id, { customer: set.customer + 1 }, { useFindAndModify: false });
				}				
			}
			console.log(update, 'updated');
		}
		else if(e.eventCategory==="INVOICE"){
			var invoice = await xero.getInvoice(e.resourceId);
			console.log(invoice);
			var payload={};
			var items=[];
			invoice.lineItems.forEach((e, i)=>{
			var itm={};
			itm.item=e.description;
			itm.price=e.unitAmount;
			itm.qty=e.quantity;
			itm.total=e.lineAmount;
			itm.tax=e.taxType;
			items.push(itm);
			});
			payload.xero=invoice.invoiceID;
			payload.issuedate=invoice.date;
			payload.title=invoice.reference;
			payload.total=invoice.total;
			payload.subtotal=invoice.subTotal;
			payload.taxamt=invoice.totalTax;
			payload.taxtype=invoice.lineAmountTypes;
			payload.items=items;
			/*var phone= (contact.phones.filter(element => {
			// 👇️ using AND (&&) operator
				return element.phoneType === "MOBILE";
				}));
				payload.phone= phone[0].phoneNumber;*/
			console.log(payload);
			var exist = await Invoices.findOne({xero:invoice.invoiceID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
			if(exist){
					var update = await Invoices.findByIdAndUpdate(exist._id, payload, {useFindAndModify:false}).then((res)=>{return res;}).catch((e)=>{return e;});
			}
			else{
				
				req.body.uid =  'INV' + Autoid;
				req.body.xero = xeroid;
			}
		}
	};
	//console.log("Xero Signature: "+req.headers['x-xero-signature'])
	//console.log(req.body);
	//console.log("webhook event received!", req.headers, req.body, JSON.parse(req.body));
	// Create our HMAC hash of the body, using our webhooks key
	let hmac = crypto.createHmac("sha256", xero_webhook_key).update(req.body.toString()).digest("base64");
	console.log("Resp Signature: "+hmac)
	//console.log(req.headers, req.body.toString());
	if (req.headers['x-xero-signature'] == hmac) {
		res.statusCode = 200
	} else {
		res.statusCode = 401
	}

	console.log("Response Code: "+res.statusCode)

	res.send()
};




