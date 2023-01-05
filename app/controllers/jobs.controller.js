const db = require("../models");
const Table = db.jobs;
const Invoice = db.invoices;
const Admin = db.adminusers;
const Quote = db.quotes;
const Enquiry = db.enquiry;
const Setting = db.settings;
const Inbox = db.inbox;
const Note = db.notes; 
const Document = db.documents; 
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
const email = require("../middleware/email"); 
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => {
  const result = await Table.find({status: { $ne: 'Trash'} });
  var set = await Setting.findById(settings_id).then();
  var Autoid = sprintf('%01d', set.job);
  var ms = await msg('jobs');
  if (!req.body)
    return res.status(400).send({ message:ms.messages[0].message });
  const id = req.params.id;
  Table.findOne({ $or: [{ name: req.body.name}], status: { $ne:'Trash' } })
    .then((data) => {
		/*if (data && data.name === req.body.name)
			return res.status(400).send({ message:'test' });
		else{*/
			req.body.uid="JOB" + Autoid;
      
      Table.create(req.body)
			.then(async(data1) => {
			  if (!data1) {
				res.status(404).send({ message: ms.messages[0].message});
			  } else {
          if(req.body.quote){
            await Quote.findByIdAndUpdate(req.body.quote, {status:'Moved to Job'}, {useFindAndModify:false});
          }
          if(req.body.enquiry){
            await Enquiry.findByIdAndUpdate(req.body.enquiry, {status:'Moved to Job'}, {useFindAndModify:false});
          }
          activity(req.body.uid+' module. '+ms.messages[2].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
		  await Setting.findByIdAndUpdate(settings_id, { job: set.job + 1 }, { useFindAndModify: false }); 
          res.send({ message: ms.messages[2].message });
      }
			})
			.catch((err) => {
				console.log(err);
			  res.status(500).send({ message:ms.messages[0].message});
			});
    //}
  })
  .catch((err) => {
  res.status(500).send({ message: ms.messages[1].message });
});
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status, show, tradie } = req.query;
  var sortObject = {};
  if(search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
  var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" }}, { abbreviation: { $regex: new RegExp(search), $options: "i" }}, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } } ]};
  }
  else
  condition = {};

  condition.status = status ? status : { $ne : 'Trash'};
  if(show) condition.show = show;
  if(tradie){ 
	condition.tradie = tradie;
	condition.status = { $ne : 'New'}
  }
  

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'agent', 'tradie', 'quote', 'enquiry'], offset, limit, sort: sortObject })
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

// Find a subcription record with an provider id
exports.autoload = async (req, res) => {

  const id = req.params.id;
  const notes = await Note.find({ job: id}).sort({ _id: -1 }).populate('createdBy');
  const mails = await Inbox.find({ job: id}).sort({ _id: -1 });
  const invoice = await Invoice.findOne({ job: id}).populate('createdBy');
  const documents = await Document.find({ job: id, status: 'Active'}).sort({ _id: -1 }).populate('createdBy');
  const details = await Table.findOne({ _id: id})
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .populate('quote')
    .populate('tradie');
  res.send({
    mails: mails,
    invoice: invoice,
    details: details,
    notes: notes,
	documents: documents
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
	Table.find({})
  .sort({name: 1})
    .then((data) => {
      res.send({list: data});
    })
    .catch((err) => {
		res.send(err);
    });
};

// Retrieve all state records from the database.
exports.findCusList = async(req, res) => {
  const id = req.params.id;
  const { show, status } = req.query;	
  var data = await Table.find({usertype: 'customer', customer: id, status: status});
  if(data.length > 0){ 
	res.send({list: data});
  }
  else{
	var data = await Table.find({usertype: 'agent', agent: id, status: status});
	res.send({list: data});
  }
};


// Send a quote to the customer
exports.sendTotradie = async(req, res) => {
	const id = req.params.id;
	var ms = await msg('jobs');
	Table.findById(id)
	  .populate('createdBy')
	  .populate('modifiedBy')
	  .populate('customer')
	  .then(async(data) => {
		if (!data)
		res.status(404).send({ message: "OK"});
		else {
			//const text = await gethtml.quotehtml();
			await Table.findByIdAndUpdate(id, {message:req.body.message, status:'In Progress'}, {useFindAndModify:false});
			await email('639ade0a63fe01870bce2c8f', 'admin', {'{subject}': req.body.subject, '{message}': req.body.message,'{email}': req.body.email, '{link}': `${tradieLink}jobs/view/${id}`, '{attachment}': req.body.attach ?`${templateLink}quotes/${id}.pdf` : null},'', req.body.message);
			res.send({message:"Job has been sent to tradie!"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid job id"});
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
  var ms = await msg('states');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .populate('quote')
    .populate('tradie')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};

// Find a single record with an id
exports.makeinvoice = async(req, res) => {
  const id = req.params.id;
  const data = await Table.findById(id);
  var info = {};  
  var set = await Setting.findById(settings_id).then();
  var Autoid = sprintf('%01d', set.invoice);
  info.uid = "INV" + Autoid;
  info.job = id;
  info.title = data.title;
  info.customer = data.customer;
  info.agent = data.agent;
  info.tenant = data.tenant;
  info.quote = data.quote;
  info.tradie = data.tradie;
  info.items = data.items;
  info.subtotal = data.subtotal;
  info.grosstotal = data.grosstotal;
  info.discamt = data.discamt;
  info.taxamt = data.taxamt;
  info.total = data.total;
  info.discount = data.discount;
  info.distype = data.distype;
  info.taxrate = data.taxrate;
  info.taxtype = data.taxtype;
  info.taxid = data.taxid;
  info.taxname = data.taxname;
  info.tax = data.tax;
  info.description = data.description;
  //info.terms = data.terms;
  info.createdBy = req.headers["user"];
  var inv = await Invoice.create(info);
  await Table.findByIdAndUpdate(id, { invoice: 1, status: 'To Invoice' }, { useFindAndModify: false }); 
  await Setting.findByIdAndUpdate(settings_id, { invoice: set.invoice + 1 }, { useFindAndModify: false }); 
  res.send({ message: "Job has beeen successfully convert as invoice", id: inv.id});
};


// Find a single record with an id
exports.quote = async(req, res) => {
  const id = req.params.id;
  var data = await Enquiry.findById(id).populate('agent').populate('customer');
  if(data){
	var name = data.usertype === 'customer' ? data.customer.firstname+' '+data.customer.lastname : data.agent.name;
	var customer = data.usertype === 'customer' ? data.customer._id : "";
	var agent = data.usertype === 'agent' ? data.agent._id : "";
	res.send({type: '1', enqid: data.uid, enquiry: data.id, quote:0, name: name, usertype: data.usertype, customer: customer, agent: agent, tenant: data.tenant, title:data.title,  address: data.jobaddress, description: data.description, items: []});
  }
  else{ 
	data = await Quote.findById(id).populate('agent').populate('customer').populate('enquiry');
	var address = data.usertype === 'customer' ? data.customer.address : data.agent.address;
	var customer = data.usertype === 'customer' ? data.customer._id : "";
	var agent = data.usertype === 'agent' ? data.agent._id : "";
	res.send({type: '0', enqid: data.uid, enquiry: data.enquiry ? data.enquiry._id : null, quote: data.id, usertype: data.usertype, customer: customer, agent: agent, tenant: data.tenant, title:data.title, address: data.enquiry ? data.enquiry.jobaddress : address, description: data.description, subtotal:data.subtotal, items: data.items, total: data.total, taxamt: data.taxamt, taxtype: data.taxtype, tradie:data.tradie}); 
  }
};


// Update a record by the id in the request
exports.update = async(req, res) => {
  var ms = await msg('jobs');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[0].message});
  const id = req.params.id;

  Table.findOne({ $or: [{ name: req.body.name}], _id: { $ne : id}})
    .then(async (data) => {		
		  await Table.findByIdAndUpdate(id, [{ $unset: ["customer", "agent", "tenant"]}]);
		  await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[0].message + err});
			  }
			  else {
				activity(ms.messages[3].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[3].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[0].message + err});
			});
      })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[0].message + err});
	});
};

// Update a record by the id in the request
exports.document = async(req, res) => {  
  var ms = await msg('jobs');
  const id = req.params.id;  
  if(req.file){
	req.body.document = req.file.filename;
	if(req.body.type === 'job')
	req.body.job = id;
	else if(req.body.type === 'quote')
	req.body.quote = id;
	else if(req.body.type === 'enquiry')
	req.body.enquiry = id;
	else if(req.body.type === 'invoice')
	req.body.invoice = id;
	else if(req.body.type === 'customer')
	req.body.customer = id;
	else if(req.body.type === 'agent')
	req.body.agent = id;
	var doc = await Document.create(req.body);
	res.send({ doc: req.file.filename, id: doc._id });
  }
  else
	res.send({ doc: '', id: 0 });
};

// Update a record by the id in the request
exports.deldocument = async(req, res) => {  
  var ms = await msg('jobs');
  const id = req.params.id;
  await Document.findByIdAndUpdate(id, {status : 'Inactive'}, { useFindAndModify: false })
  res.send({ message: 'Document has been successfully deleted.' });
};

exports.trash = async(req, res) => {
	var ms = await msg('jobs');
	const id = req.params.id;

	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[0].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Trash'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[0].message});
			  }
			  else {
				activity(ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
				  res.send({ message: ms.messages[5].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[0].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[0].message});
	  });
};

exports.restore = async(req, res) => {
  var ms = await msg('jobs');
	const id = req.params.id;

	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[0].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Active'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[6].message});
			  }
			  else {
				activity(ms.messages[6].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
				  res.send({ message: ms.messages[6].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[0].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[0].message});
	  });
};
