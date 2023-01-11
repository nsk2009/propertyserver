const db = require("../models");
const Table = db.settings;
const Dateformat = db.dateformat;
const Timezone = db.timezone;
const Emailapi = db.emailapi;
const Smsapi = db.smsapi;
const Tax = db.taxes; 
const Bank = db.banks; 
const Paymentapi = db.accountingapis;
const Transactions = db.transactions;
const Invoice = db.invoices;
const Job = db.jobs;
const Enquiry = db.enquiry;
const Quote = db.quotes;
const Customer = db.customer;
const Tradie = db.tradie;
const Agent = db.agent;
const activity = require("../middleware/activity");
const xero = require("../middleware/xero");
var fs = require('fs');

// Find a single record with an id
exports.findOne = async(req, res) => {
	//await Dateformat.deleteMany({});
	//DD/MM/YYYY
//MMMM Do, YYYY
//DD-MM-YYYY
//MMMM DD, YYYY
	/*await Dateformat.create({script: 'DD/MM/YYYY'});
	await Dateformat.create({script: 'DD-MM-YYYY'});
	await Dateformat.create({script: 'MMMM DD, YYYY'});
	await Dateformat.create({script: 'MMMM Do, YYYY'});*/
	const dates = await Dateformat.find();
	const times = await Timezone.find();
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send({data: data, dateformats: dates, timezones: times});
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving record with id=" + id });
    });
};

// Retrieve all state records from the database.
exports.xeroupdates = async(req, res) => {
	const taxes = await xero.getTaxes();
	var accs = [];var oldaccs = [];	
	taxes.map((e, i)=>{
		if(e.canApplyToRevenue === true){
			accs.push(e);
			oldaccs.push(e.name);
		}
    });
	await Tax.deleteMany({name: { $in: oldaccs }})
	await Tax.insertMany(accs);
	const banks = await xero.getAccounts();
	var accs = [];var oldaccs = [];	 
	banks.map((e, i)=>{
		accs.push(e);
		oldaccs.push(e.name);
    });
	await Bank.deleteMany({name: { $in: oldaccs }})
	await Bank.insertMany(accs);
	res.send({message: "Xero updates successfully completed"}); 
};

// Find a single record with an id
exports.findLogo = async(req, res) => {
  
  const dates = await Dateformat.find();
  const times = await Timezone.find();
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send({logo: data.logo, dateformats: dates, timezones: times});
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.update = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  //console.log(req.file);
  var set = await Table.findById(id);
  if(req.file){
	  fs.unlinkSync(__basedir+'/uploads/'+set.logo);
  req.body.logo = req.file.filename;
  }
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
		const logo = req.file ? req.file.filename : data.logo;
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } 
	  else {
		  //console.log(req.socket.remoteAddress);
		  //console.log(req.connection.remoteAddress);
      activity( data.title + ' Details has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
      res.send({ logo: logo, message: "Record was updated successfully." });
  }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};
 
// Update a record by the id in the request
exports.quote = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  console.log(req.file);
  var set = await Table.findById(id); 
  if(req.file){
	  fs.unlinkSync(__basedir+'/uploads/'+set.quotelogo);
  req.body.quotelogo = req.file.filename;
  }
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
		const logo = req.file ? req.file.filename : data.quotelogo;
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } 
	  else {
		  //console.log(req.socket.remoteAddress);
		  //console.log(req.connection.remoteAddress);
      activity( 'Quote setting details has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
      res.send({ logo: logo, message: "Record was updated successfully." });
  }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};

// Update a record by the id in the request
exports.invoice = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  //console.log(req.file);
  var set = await Table.findById(id);
  if(req.file){
	  //fs.unlinkSync(__basedir+'/uploads/'+set.invoicelogo);
  req.body.invoicelogo = req.file.filename;
  }
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
		const logo = req.file ? req.file.filename : data.invoicelogo;
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } 
	  else {
		  //console.log(req.socket.remoteAddress);
		  //console.log(req.connection.remoteAddress);
      activity('Invoice setting details has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
      res.send({ logo: logo, message: "Record was updated successfully." });
  }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};

// Find a single record with an id
exports.findemailapi = async(req, res) => {
  const id = req.params.id;
  //await Emailapi.create({user: id}).then();
  Emailapi.findOne({user: id})
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.updateemailapi = (req, res) => {
  const id = req.params.id;
  Emailapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else res.send({ message: "Record was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};
// Find a single record with an id
exports.findsmsapi = async(req, res) => {
   const id = req.params.id;
  //await Smsapi.create({user: id}).then();
  Smsapi.findOne({user: id})
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.updatesmsapi = (req, res) => {
  const id = req.params.id;
  Smsapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else {
        activity( data.title + ' SMS API has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
        res.send({ message: "Record was updated successfully." });
    }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};
// Find a single record with an id
exports.findpaymentapi = async(req, res) => {
  const id = req.params.id;
  //await Paymentapi.create({user: id}).then();
  Paymentapi.findOne({user: id})
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.updatepaymentapi = (req, res) => {
  const id = req.params.id;
  Paymentapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else {
        activity( data.title + ' Payment API has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
        res.send({ message: "Record was updated successfully." });
    }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};

exports.findInvoice = async (req, res) => {
  const { id } = req.params;
  const logo = await Table.findOne({_id: '6275f6aae272a53cd6908c8d'});
  Transactions.findOne({_id:id,type:'Subscription'}).populate('sub_id').populate('customer_id')
    .then(data => {
      if (!data)
        return res.status(404).send({ message: "No record found!" });
      res.status(200).send({logo : logo.logo, data: data});
    })
    .catch(err => {
      res.status(400).send({ message: "Invalid Customer id" });
    })
};

exports.globalsearch = async (req, res) => {
	const { search } = req.query;
	let invoices = [];
	let jobs = [];
	let enquiries = [];
	let quotes = [];
	let customers = [];
	let tradies = [];
	let agents = [];

	if (search) {

		var inv_cond = { $or: [{ status: { $regex: new RegExp(search), $options: "i" } }, { title: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }] };

		var job_cond = { $or: [{ title: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { address: { $regex: new RegExp(search), $options: "i" } }, { description: { $regex: new RegExp(search), $options: "i" } }] };

		var enq_cond = { $or: [{ phone: { $regex: new RegExp(search), $options: "i" } }, { email: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { address: { $regex: new RegExp(search), $options: "i" } }, { company: { $regex: new RegExp(search), $options: "i" } }, { title: { $regex: new RegExp(search), $options: "i" } }, { jobaddress: { $regex: new RegExp(search), $options: "i" } }, { description: { $regex: new RegExp(search), $options: "i" } }, { source: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }]};

		var qut_cond = { $or: [{ status: { $regex: new RegExp(search), $options: "i" } }, { tstatus: { $regex: new RegExp(search), $options: "i" } }, { name: { $regex: new RegExp(search), $options: "i" } }, { title: { $regex: new RegExp(search), $options: "i" } }, { description: { $regex: new RegExp(search), $options: "i" } }, { terms: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }] };

		var cust_cond = { $or: [{ firstname: { $regex: new RegExp(search), $options: "i" } }, { lastname: { $regex: new RegExp(search), $options: "i" } }, { phone: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { email: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }, { address: { $regex: new RegExp(search), $options: "i" } }] };

		var trd_cond = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { company: { $regex: new RegExp(search), $options: "i" } }, { phone: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { email: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }, { accname: { $regex: new RegExp(search), $options: "i" } }, { accnum: { $regex: new RegExp(search), $options: "i" } }, { abn: { $regex: new RegExp(search), $options: "i" } }, { bsbcode: { $regex: new RegExp(search), $options: "i" } }, { billaddress: { $regex: new RegExp(search), $options: "i" } }] };

		var agt_cond = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { company: { $regex: new RegExp(search), $options: "i" } }, { phone: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { email: { $regex: new RegExp(search), $options: "i" } }, { uid: { $regex: new RegExp(search), $options: "i" } }, { address: { $regex: new RegExp(search), $options: "i" } }, { description: { $regex: new RegExp(search), $options: "i" } }] };
		
		invoices = await Invoice.find(inv_cond).select({ title: 1, uid: 1, status: 1, duedate: 1, issuedate: 1, total:1 });
    jobs = await Job.find(job_cond).select({ title: 1, uid: 1, status: 1, address: 1, startdate: 1, duedate: 1 });
    enquiries = await Enquiry.find(enq_cond).select({ title: 1, uid: 1, phone: 1, email: 1, status: 1 });
    quotes = await Quote.find(qut_cond).select({ title: 1, uid: 1, name: 1, tstatus: 1, status: 1, uid: 1, quote_date: 1 });
    tradies = await Tradie.find(trd_cond).select({ name: 1, company: 1, phone: 1, status: 1, email: 1, uid: 1, accname: 1 });
    customers = await Customer.find(cust_cond).select({ firstname: 1, lastname: 1, phone: 1, status: 1, email: 1, uid: 1, address: 1 });
    agents = await Agent.find(agt_cond).select({ name: 1, company: 1, phone: 1, status: 1, email: 1, uid: 1, address: 1 });
	}
	res.send({
		invoices: invoices,
		jobs: jobs,
		enquiries: enquiries,
		quotes: quotes,
		customers: customers,
		tradies: tradies,
		agents: agents
	});
}