const db = require("../models");
const Table = db.invoices;
const Admin = db.adminusers;
const Customer = db.customer;
const Agent = db.agent;
const Setting = db.settings;
const Inbox = db.inbox;
const Note = db.notes;
const Job = db.jobs;
const Payment = db.payments;
const Document = db.documents; 
const msg = require("../middleware/message");
const puppeteer = require("puppeteer");
const activity = require("../middleware/activity");
const gethtml = require("../middleware/pdfhtml");
const email = require("../middleware/email");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
const xero = require("../middleware/xero");
var fs = require("fs"); 
var css = fs.readFileSync("./css/quote.css", "utf8");
//const pdf = require("../../pdf");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => { 
	const result = await Table.find({status: { $ne: 'Trash'} });
	var set = await Setting.findById(settings_id).then();
	var Autoid = sprintf('%01d', set.invoice);
	var ms = await msg('invoices');
	if (!req.body)
		return res.status(400).send({ message:ms.messages[1].message });
	const xeroid = await xero.createInvoice(req.body);
	if(xeroid !== 'error'){
		req.body.uid =  'INV' + Autoid;
		req.body.xero = xeroid; 
		req.body.due = req.body.total;
		Table.create(req.body)
		.then(async(data1) => {
			if (!data1) {
				res.status(404).send({ message: ms.messages[1].message});
			} 
			else {
				if(req.body.job)
				await Job.findByIdAndUpdate(req.body.job, { invoice: 1, status: 'To Invoice' }, { useFindAndModify: false });
				generatePdf(data1._id);
				activity(req.body.name+' module. '+ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
				await Setting.findByIdAndUpdate(settings_id, { invoice: set.invoice + 1 }, { useFindAndModify: false });
				res.send({ message: ms.messages[0].message });
			}
		})
		.catch((err) => {
			res.status(500).send({ message:ms.messages[1].message});
		});
	}
	else{
		res.status(400).send({ message: ms.messages[1].message });
	}
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status, show } = req.query;
  var sortObject = {};
  if(search){
  var admins = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }}, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
  const adminids = [];
	admins.forEach(function(doc, err) {
	  adminids.push(doc._id);
	});
  var customers = await Customer.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }}, {lastname: { $regex: new RegExp(search), $options: "i" }}, {uid: { $regex: new RegExp(search), $options: "i" }}]});
  const custids = [];
	customers.forEach(function(doc, err) {
	  custids.push(doc._id);
	});
  var agents = await Agent.find({ status : { $ne : 'Trash'}, $or: [{name: { $regex: new RegExp(search), $options: "i" }}, {uid: { $regex: new RegExp(search), $options: "i" }}]});
  const agentids = [];
	agents.forEach(function(doc, err) {
	  agentids.push(doc._id);
	});
  var jobs = await Job.find({ status : { $ne : 'Trash'}, $or: [{uid: { $regex: new RegExp(search), $options: "i" }}]});
  const jobids = [];
	jobs.forEach(function(doc, err) {
	  jobids.push(doc._id);
	});
  var condition = { $or: [{ title: { $regex: new RegExp(search), $options: "i" }}, { uid: { $regex: new RegExp(search), $options: "i" }}, { job: { $in: jobids }}, { agent: { $in: agentids }}, { customer: { $in: custids }}, { modifiedBy: { $in: adminids } }, { createdBy: { $in: adminids } } ]};
  }
  else
  condition = {};

  condition.status = status ? status : { $ne : 'Trash'};
  if(show) condition.show = show;

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'job', 'quote','agent'], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
		res.send(err);
    });
};

// Retrieve all records from the database.
exports.findStates = async (req, res) => {
	var ms = await msg('states');
  
	Table.find({ status: "Active" }).sort({ name: 1 })
	  .then((data) => {
		var info = [];
		data.forEach(function (doc, err) {
		  info.push({ label: doc.name, value: doc._id });
		});
		res.send({ list: info });
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[4].message });
	  });
  };

// Retrieve all state records from the database.
// Application Service
exports.findList = async(req, res) => {
	const { show, status } = req.query;
	Table.find({show: show, status: status})
  .sort({name: 1})
    .then((data) => {
      res.send({list: data});
    })
    .catch((err) => {
		res.send(err);
    });
};


// Send a quote to the customer
exports.sendToCustomer = async(req, res) => {
	const id = req.params.id;
	var ms = await msg('invoices');
	Table.findById(id)
	  .populate('createdBy')
	  .populate('modifiedBy')
	  .populate('customer')
	  .then(async(data) => {
		if (!data)
		res.status(404).send({ message: "OK"});
		else {
			//const text = await gethtml.quotehtml();
			var updata = await Table.findByIdAndUpdate(id, {message:req.body.message, status:'Awaiting Payment', sent: 1}, {useFindAndModify:false});	
			const xeroid = await xero.updateInvoice(updata);		
			var filename = `/invoices/${id}.pdf`;
			await email('6396f126e4b241356ccb5cf5', 'admin', {'{subject}': req.body.subject, '{message}': req.body.message,'{email}': req.body.email, '{attachment}': req.body.attach ? filename : null}, '', req.body.message);
			res.send({message:"Invoice has been sent to customer!"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid invoice id"});
	  });
  };

// Retrieve all records from the database.
exports.trashAll = async(req, res) => {
  const { page, size, search, field, dir } = req.query;
  var sortObject = {};
  if(search)
  var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" }}, { abbreviation: { $regex: new RegExp(search), $options: "i" }} ]};
  else
  condition = {};

 sortObject[field] = dir;
 condition.status = 'Trash';

  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy','category'], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
		res.send(err + 'err');
    });
};


// Find a single record with an id
exports.findOne = async(req, res) => {
  const id = req.params.id;
  var ms = await msg('invoices');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .populate('quote')
    .populate('tradie')
    .populate('job')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id dfd"});
    });
};

// Find a single record with an id
exports.details = async(req, res) => {
  const id = req.params.id;
  var ms = await msg('invoices');
  const notes = await Note.find({ invoice: id}).sort({ _id: -1 }).populate('createdBy');
  const mails = await Inbox.find({ invoice: id}).sort({ _id: -1 });
  const payments = await Payment.find({ invoice: id, status: 'Active'}).sort({ _id: 1 });
  const documents = await Document.find({ invoice: id, status: 'Active'}).sort({ _id: -1 }).populate('createdBy');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .populate('quote')
    .populate('tradie')
    .populate('job')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send({ data: data, notes: notes, mails: mails, documents: documents, payments: payments});
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};

// Find a single record with an id
exports.job = async(req, res) => {
	const id = req.params.id;
	var data = await Job.findById(id);
	res.send({type: '0', jobid: data.uid, job: data.id, usertype: data.usertype, customer: data.customer, agent: data.agent, tenant: data.tenant, title:data.title, description: data.description, subtotal:data.subtotal, items: data.items, taxtype: data.taxtype, tradie:data.tradie});
};

// Update a record by the id in the request
exports.update = async(req, res) => {
	var ms = await msg('invoices');
	if (!req.body)
		return res.status(400).send({ message: ms.messages[3].message});
	const id = req.params.id;
	const xeroid = await xero.updateInvoice(req.body);
	if(xeroid !== 'error'){
		req.body.due = req.body.total;
		Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
		.then((data) => {
			if (!data) {
				res.status(404).send({ message: ms.messages[3].message});
			}
			else {
				generatePdf(id);
				activity(ms.messages[2].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				res.send({ message: ms.messages[2].message });
			}
		})
		.catch((err) => {
			res.status(500).send({ message: ms.messages[3].message});
		});
	}
	else{
		res.status(500).send({ message: ms.messages[3].message});
	}
};

// Payment a record by the id in the request
exports.payment = async(req, res) => {
	var ms = await msg('invoices');
	if (!req.body)
		return res.status(400).send({ message: ms.messages[3].message});
	const id = req.params.id;
	var invo = await Table.findById(id);
	req.body.amount = parseFloat(req.body.amount);
	req.body.invoiceID = invo.xero;
	const xeroid = await xero.addPayment(req.body);
	console.log(xeroid);
	if(xeroid.message === 'success'){
		req.body.xero = xeroid;
		var set = await Setting.findById(settings_id).then();
		req.body.uid="PAY"+set.payment;			
		Payment.create(req.body)
		.then(async(data) => {
			if (!data) {
				res.status(404).send({ message: ms.messages[3].message});
			}
			else {				
				await Table.findByIdAndUpdate(id, { paid: invo.paid + req.body.amount ,due: invo.due-req.body.amount }, { useFindAndModify: false })
				await Setting.findByIdAndUpdate(settings_id, { payment: set.payment+1 }, { useFindAndModify: false });
				activity(ms.messages[9].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
				res.send({ message: ms.messages[9].message });
			}
		})
		.catch((err) => {
			res.status(500).send({ message: ms.messages[3].message});
		});
	}
	else{
		res.status(500).send({ message: xeroid.message});
	}
};

// Payment a record by the id in the request
exports.removepayment = async(req, res) => {
	var ms = await msg('invoices');
	const id = req.params.id;
	const pay = req.params.pay;
	var invo = await Table.findById(id);
	var payment = await Payment.findById(pay);
	const xeroid = await xero.removePayment(payment.xero);
	if(xeroid !== 'error'){
		await Table.findByIdAndUpdate(id, { paid: invo.paid - payment.amount ,due: invo.due+payment.amount }, { useFindAndModify: false });
		await Payment.findByIdAndUpdate(pay, { status: 'Trash' }, { useFindAndModify: false });
		activity(ms.messages[10].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
		res.send({ message: ms.messages[10].message });
	}
	else{
		res.status(500).send({ message: ms.messages[3].message});
	}
};

const generatePdf = async(id) => {
	var data= await gethtml.invoicehtml(id);
	var foot= await gethtml.quotefooter();
	var header= await gethtml.pdfheader();
	const browser = await puppeteer.launch(chromium);
	const page = await browser.newPage();  
	
	await page.setContent(`<style>${css}</style>${data}`, { waitUntil: ['domcontentloaded', 'networkidle2'] });
	await page.pdf({
		path: `./invoices/${id}.pdf`,
		format: "A4",
		displayHeaderFooter:true,
		headerTemplate: header,
		footerTemplate: foot,
		printBackground : true,
		preferCSSPageSize: false,
		margin : {top: "140px", bottom : "40px"} 
	} ); 
	await browser.close();
	//res.send(`${id}.pdf`); 
	return 'generated';
};

exports.trash = async(req, res) => {
	var ms = await msg('invoices');
	const id = req.params.id;

	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[6].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Trash'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[6].message});
			  }
			  else {
				activity(ms.messages[4].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
				  res.send({ message: ms.messages[4].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[6].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[6].message});
	  });
};

exports.restore = async(req, res) => {
  var ms = await msg('invoices');
	const id = req.params.id;

	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[7].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Active'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[7].message});
			  }
			  else {
				activity(ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
				  res.send({ message: ms.messages[5].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[7].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[7].message});
	  });
};
