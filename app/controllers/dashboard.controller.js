const config = require("../config/auth.config");
const crypto = require('crypto')
const db = require("../models");
const Paymentapi = db.accountingapis;
const xero = require("../middleware/xero");
const ts = require("../middleware/timeline");
const Customers = db.customer;
const Invoice = db.invoices;
const Job = db.jobs;
const Quote = db.quotes;
const Enquiry= db.enquiry;
const Agents = db.agent;
const Payment = db.payments;
const Setting = db.settings;
const Moment = require('moment-timezone');

var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
// cms
exports.cms = async (req, res) => {
	await Invoice.updateMany({ status: 'Awaiting Payment', duedate: { $lt:new Date()} },{$set: {status: 'Overdue'}});
    const { timeline, from, to, year } = req.query;
	var condition = {};
	let result = {};
	//if (timeline) {
		if (timeline !== '7') {
			result = await ts(timeline, year);
			start = new Date(result.begin);
			end = new Date(result.end);
		}
		else {
			result['begin'] = from + 'T00:00:00.000Z';
			result['end'] = to + 'T23:59:59.000Z';
			start = new Date(result.begin);
			end = new Date(result.end);
		}
		condition.createdAt = { $gte: start, $lt: end };
	//}
	var enquiries = await Enquiry.find(condition);
	//console.log(condition);
	var quotes = await Quote.aggregate([
	  { $match: condition },
	  { $group: {
		_id: { id: "$status" },
		total: { $sum: "$total" },
		/*totalServices: {
		  $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] }
		},*/
		count: { $sum: 1 }
	  }}
	]);	
	var grquotes = await Job.aggregate([
	  //{ $match: condition },
	  { $group: {
		_id: { status: "$status", month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
		total: { $sum: "$total" },
		/*totalServices: {
		  $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] }
		},*/
		count: { $sum: 1 },
		"date": { "$first": "$createdAt" }
	  }},
	  { $sort : { createdAt : 1 } }
	  //{ $project : { total: 1, count: 1, createdAt: 1 }}
	]);
	const months = [];
	const dra = [];
	const pro = [];
	const inv = [];
	const com = [];
	grquotes.forEach(function (doc, err) {
		var mon =  Moment(doc.date).format('MMM, YYYY');
		if (!months.includes(mon)){
			months.push(mon);
			dra[mon] = 0;
			pro[mon] = 0;
			inv[mon] = 0;
			com[mon] = 0;
		}
		if (doc._id.status === 'New')
			dra[mon] += doc.total;
		else if (doc._id.status === 'In Progress')
			pro[mon] += doc.total;
		else if (doc._id.status === 'To Invoice')
			inv[mon] += doc.total;
		else if (doc._id.status === 'Completed')
			com[mon] += doc.total;
	});	
	//console.log(dra);
	var jobs = await Job.aggregate([
	  //{ "$match": { "status": { $in: ['Draft','Awaiting Payment','Overdue','Completed']}  }},
	  { $match: condition },
	  { $group: {
		_id: { id: "$status" },
		total: { $sum: "$total" },
		/*totalServices: {
		  $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] }
		},*/
		count: { $sum: 1 }
	  }}
	]);
	//console.log(quotes, jobs);
	var invoices = await Invoice.aggregate([
	  //{ "$match": { "status": { $in: ['Draft','Awaiting Payment','Overdue','Completed']}  }},
	  { $match: condition },
	  { $group: {
		_id: { id: "$status" },
		total: { $sum: "$total" },
		/*totalServices: {
		  $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] }
		},*/
		count: { $sum: 1 }
	  }}
	]);
	await res.send({enquiries: enquiries.length, quotes: quotes, jobs: jobs, invoices: invoices, chart: {months: months, draft: Object.values(dra), progress: Object.values(pro), invoice: Object.values(inv), complete: Object.values(com)}});
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
		//console.log(e);
		if(e.eventCategory==="CONTACT"){
			var contact = await xero.getContact(e.resourceId);
			//console.log(contact);
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
			//console.log(payload);
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
			//console.log(update, 'updated');
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
			payload.issuedate=invoice.date;
			payload.duedate=invoice.dueDate;
			payload.due=invoice.amountDue;
			payload.paid=invoice.amountPaid;
			payload.items=items;
			if(invoice.status === 'DRAFT')
				payload.status = 'Draft'
			else if(invoice.status === 'AUTHORISED' && new Date(invoice.dueDate) < new Date())
				payload.status = 'Overdue'
			else if(invoice.status === 'AUTHORISED')
				payload.status = 'Awaiting Payment'
			else if(invoice.status === 'PAID')
				payload.status = 'Completed'
			var exist = await Customers.findOne({xero:invoice.contact.contactID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
			if(exist){				
				payload.customer = exist._id;
				payload.usertype = 'customer';
			}
			else{
				var existAgent = await Agents.findOne({xero:invoice.contact.contactID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
				if(existAgent){
					payload.customer = existAgent._id;
					payload.usertype = 'agent';
				}
			}
			var set = await Setting.findById(settings_id).then();
			var exist = await Invoice.findOne({xero:invoice.invoiceID}).then((res)=>{return res;}).catch((e)=>{console.log(e); return "error";});
			if(exist){
					var update = await Invoice.findByIdAndUpdate(exist._id, payload, {useFindAndModify:false}).then((res)=>{return res;}).catch((e)=>{return e;});
			}
			else{
				var Autoid = sprintf('%01d', set.invoice);
				payload.uid="INV"+Autoid; 
				var update = await Invoice.create(payload).then((res)=>{return res;}).catch((e)=>{return e;});	
				await Setting.findByIdAndUpdate(settings_id, { invoice: set.invoice + 1 }, { useFindAndModify: false });
			}
			await Payment.updateMany({ invoice: update._id }, { $set: { status : 'Trash' } });
			var Autopayid = set.payment;			
			for(const p of invoice.payments){
				var pay = {};
				pay.invoice = update._id;
				pay.date = p.date;
				pay.amount = p.amount;
				pay.xero = p.paymentID;
				pay.status = 'Active';
				var payup = await Payment.findOneAndUpdate({xero: p.paymentID}, pay, { useFindAndModify: false });
				if(!payup){
					var Payid = sprintf('%01d', Autopayid);
					pay.uid="PAY"+Payid;
					await Payment.create(pay);
					Autopayid++;
				}
			}
			await Setting.findByIdAndUpdate(settings_id, { payment: Autopayid }, { useFindAndModify: false });
		}
	};
	//console.log("Xero Signature: "+req.headers['x-xero-signature'])
	//console.log(req.body);
	//console.log("webhook event received!", req.headers, req.body, JSON.parse(req.body));
	// Create our HMAC hash of the body, using our webhooks key
	let hmac = crypto.createHmac("sha256", xero_webhook_key).update(req.body.toString()).digest("base64");
	//console.log("Resp Signature: "+hmac)
	//console.log(req.headers, req.body.toString());
	if (req.headers['x-xero-signature'] == hmac) {
		res.statusCode = 200
	} else {
		res.statusCode = 401
	}

	//console.log("Response Code: "+res.statusCode)

	res.send()
};




