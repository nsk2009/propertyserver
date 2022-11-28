const db = require("../models");
const Table = db.jobs;
const Invoice = db.invoices;
const Admin = db.adminusers;
const Quote = db.quotes;
const Enquiry = db.enquiry;
const Setting = db.settings;
const Inbox = db.inbox;
const Note = db.notes;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
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
  if(tradie) condition.tradie = tradie;

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'tradie', 'quote', 'enquiry'], offset, limit, sort: sortObject })
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
  /*const transactions = await Transactions.find({ customer_id: id }).populate([{ path: "advance_id", select: ["advance_amount", "advance_id"] }])
    .populate([{ path: "sub_id", select: ["plan_amount", "subs_id"] }]).limit(Number(page8)).sort({ txndate: -1 });
  const advances = await Advance.find({ customer_id: id }).limit(Number(page7)).sort({ advance_date: -1 });
  const subscriptions = await Subscription.find({ customer_id: id }).limit(Number(page5)).sort({ createdAt: -1 });
  var subsPayment = [];
  if(subsId !== '' )
  subsPayment = await Transactions.find({ type: "Subscription", sub_id: subsId }).limit(Number(page5)).populate(['customer_id', 'plan_id']).sort({ _id: -1 });
  const notes = await Notes.find({ to: id }).limit(Number(page1)).populate(['createdBy']).sort({ _id: -1 });
  const sms = await SMSnotifi.find({ user: id }).limit(Number(page3)).populate(['createdBy']).sort({ _id: -1 });
  const email = await CustNotifi.find({ user: id }).limit(Number(page3)).populate(['createdBy']).sort({ _id: -1 });
  const calls = await Calls.find({ customer_id: id }).limit(Number(page2)).populate(['createdBy']).sort({ _id: -1 });*/
  //const invoices = await Invoice.find({ job: id});
  const notes = await Note.find({ job: id}).sort({ _id: -1 }).populate('createdBy');
  const mails = await Inbox.find({ job: id}).sort({ _id: -1 });
  const invoice = await Invoice.findOne({ job: id});
  const details = await Table.findOne({ _id: id})
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('quote')
    .populate('tradie');
  res.send({
    mails: mails,
    invoice: invoice,
    details: details,
    notes: notes,
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
  info.customer = data.customer;
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
  var data = await Enquiry.findById(id);
  if(data){ 
	res.send({type: '1', enqid: data.uid, enquiry: data.id, quote:0, customer: data.customer, title:data.title,  address: data.jobaddress, description: data.description, items: []});
  }
  else{
	data = await Quote.findById(id);
	res.send({type: '0', enqid: data.uid, enquiry: data.enquiry, quote: data.id, customer: data.customer, address: '', description: data.description, subtotal:data.subtotal, items: data.items, tax: data.tax, discount: data.discount, distype: data.distype, tradie:data.tradie});
  }
};


// Update a record by the id in the request
exports.update = async(req, res) => {
  var ms = await msg('jobs');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[0].message});
  const id = req.params.id;

  Table.findOne({ $or: [{ name: req.body.name}], _id: { $ne : id}})
    .then((data) => {
		/*if (data && data.name === req.body.name)
			return res.status(400).send({ message: ms.messages[1].message });

		else{*/
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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
		//}
      })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[0].message + err});
	});
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
