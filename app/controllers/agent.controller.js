const db = require("../models");
const Table = db.agent;
const Tenant = db.tenant;
const Admin = db.adminusers;
const Setting = db.settings;
const Job = db.jobs;
const Quote = db.quotes;
const Note = db.notes;
const Invoice = db.invoices;
const Inbox = db.inbox;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
const excel = require("exceljs");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => {
	var ms = await msg('Agent');
	var set = await Setting.findById(settings_id).then();
	var Autoid = sprintf('%01d', set.agent);
	if (!req.body.name && !req.body.email)    
	  return res.status(400).send({ message: ms.messages[0].message });
		req.body.phone = req.body.phone;
		req.body.email = req.body.email.trim();
	  var phone = req.body.phone;
	  var email = req.body.email;
	  Table.findOne({ $or: [{ email: email}, { phone: phone}], status : { $ne : 'Trash'}})
	  .then((data) => {
		  if (data && data.email === email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else if (data && data.phone === phone)
			  return res.status(400).send({ message: ms.messages[2].message });
		  else{		
			req.body.uid= "AID"+Autoid;  
			  Table.create(req.body)
			  .then(async(data) => { 
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			activity(`${req.body.name} Agent created successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
			await Setting.findByIdAndUpdate(settings_id, { agent: set.agent + 1 }, { useFindAndModify: false });
			res.send({ message: ms.messages[5].message, id:data._id });
		}
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[4].message });
			  });
	  }
	}).catch((err) => {
	  res.status(500).send({ message: ms.messages[4].message });
	});
		  
  };

// Create and Save a new record
exports.createtenant = async(req, res) => {
	var ms = await msg('Agent');
	if (!req.body.name && !req.body.email)    
	  return res.status(400).send({ message: ms.messages[0].message });
		req.body.phone = req.body.phone;
		req.body.email = req.body.email.trim();
	  var phone = req.body.phone;
	  var email = req.body.email;
	  Tenant.findOne({ $or: [{ email: email}, { phone: phone}], status : { $ne : 'Trash'}})
	  .then((data) => {
		  if (data && data.email === email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else if (data && data.phone === phone)
			  return res.status(400).send({ message: ms.messages[2].message });
		  else{		 
			  Tenant.create(req.body)
			  .then(async(data) => { 
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
					activity(`${req.body.name} tenant created successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
					res.send({ message: ms.messages[5].message, id:data._id });
				}
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[4].message });
			  });
	  }
	}).catch((err) => {
	  res.status(500).send({ message: ms.messages[4].message });
	});
		  
  };

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status, show } = req.query;
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

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy'], offset, limit, sort: sortObject })
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

// Find a single record with an id
exports.findOne = async(req, res) => {
	var ms = await msg('Agent');
	const id = req.params.id;
	const ip = req.headers['x-forwarded-for'];
	Table.findById(id)
	  .populate('createdBy')
	  .populate('modifiedBy')
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[3].message });
		else res.send(data);
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[3].message });
	  });
  };

// Find a single record with an id
exports.gettenant = async(req, res) => {
	var ms = await msg('Agent');
	const id = req.params.id;
	const ip = req.headers['x-forwarded-for'];
	Tenant.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[3].message });
		else res.send(data);
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[3].message });
	  });
  };

// Find a single record with an id
exports.details = async(req, res) => {
	const id = req.params.id;
	const ip = req.headers['x-forwarded-for'];
	const data = await Table.findById(id).populate('createdBy').populate('modifiedBy');	
	const jobs = await Job.find({agent: id}).populate('tradie');
	const info = [];
	jobs.forEach(function(doc, err) {
	  info.push(doc._id);
	});
	const mails = await Inbox.find({ job: { $in: info }}).sort({ _id: -1 });
    const notes = await Note.find({ agent: id}).sort({ _id: -1 }).populate('createdBy');
    const tenants = await Tenant.find({ agent: id}).sort({ _id: -1 }).populate('createdBy');	
	const quotes = await Quote.find({agent: id}); 
	const invoices = await Invoice.find({agent: id}); 
	res.send({data:data, jobs: jobs, quotes: quotes, invoices: invoices, mails: mails, notes: notes, tenants: tenants});
  };

  // Find a single record with an id
exports.findList = async(req, res) => {
	
	var ms = await msg('Agent');
	Table.find({status:'Active'})
	  .populate('createdBy')
	  .populate('updatedBy')
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[3].message });
		else res.send({list:data});
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[3].message });
	  });
  };
  
  // Update all records from the database.
  exports.updateAll = async(req, res) => {
	var ms = await msg('Agent');
	const { ids, status } = req.query;
	Table.updateMany(
	 { _id: { $in: JSON.parse(ids) } },
	 { $set: { status : status } })
	  .then((data) => {
		activity(`${data.nModified} Lead ${status} status updated successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
		res.send({
		  message: ms.messages[6].message,
		});
	  })
	  .catch((err) => {
		res.status(500).send({
		  message:
			err.message || "Some error occurred while removing all records.",
		});
	  });
  };
  
  // Update a record by the id in the request
  exports.update = async(req, res) => {
	var ms = await msg('Agent');
	if (!req.body)
	  return res.status(400).send({ message: ms.messages[0].message});
	const id = req.params.id; 
	Table.findOne({ $or: [{ email: req.body.email}, { phone: req.body.phone}], status : { $ne : 'Trash'}, _id: { $ne : id}})
	  .then(async(data) => {
		  /*var set = await Api.findOne({ user: 'admin' });
	  var sid = set.twilio_type === 'Live' ? set.live_twilio_accountsid : set.sand_twilio_accountsid;
	  var token = set.twilio_type === 'Live' ? set.live_twilio_authtoken : set.sand_twilio_authtoken;
	  var twilph = set.twilio_type === 'Live' ? set.live_twilio_number : set.sand_twilio_number;
	  var sms = twilio(sid, token);
	  const validnum = sms.lookups.v1.phoneNumbers('+919894052844')
				.fetch()
				.then((phone_number) => { return phone_number})
				.catch((error) => {return error} );*/
		  //console.log(data);
		  if (data && data.email === req.body.email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else if (data && data.phone === req.body.phone)
			  return res.status(400).send({ message: ms.messages[2].message });
		  else{
		const olddata = await Table.findById(id); 
			await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			  .then(async(data) => {
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
		   
			activity(`${req.body.firstname} agent updated successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
			res.send({ message: ms.messages[6].message });
		  }
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[3].message });
			  });
		  }
		})
		.catch((err) => {
		  res.status(500).send({ message: ms.messages[3].message });		  
	  });
  };
  
// Update and Save a new record
exports.updatetenant = async(req, res) => {
	var ms = await msg('Agent');
	if (!req.body.name && !req.body.email)    
	  return res.status(400).send({ message: ms.messages[0].message });  
	const id = req.params.id; 
		req.body.phone = req.body.phone;
		req.body.email = req.body.email.trim();
	  var phone = req.body.phone;
	  var email = req.body.email;
	  Tenant.findOne({ $or: [{ email: email}, { phone: phone}], status : { $ne : 'Trash'}, _id: { $ne : id}})
	  .then(async(data) => {
		  if (data && data.email === email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else if (data && data.phone === phone)
			  return res.status(400).send({ message: ms.messages[2].message });
		  else{		 
			await Tenant.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			  .then(async(data) => { 
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
					activity(`${req.body.name} tenant updated successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
					res.send({ message: ms.messages[5].message, id:data._id });
				}
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[4].message });
			  });
	  }
	}).catch((err) => {
	  res.status(500).send({ message: ms.messages[4].message });
	});
		  
  };
  
  exports.updateColumns = async(req, res) => {
	var ms = await msg('Agent');
  const id = req.params.id;
	Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
	.then((data) => {
	  if (!data) {
	  res.status(404).send({ message: ms.messages[3].message});
	  } else{
		activity('Lead columns updated successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
		res.send({ message: ms.messages[6].message });
	}
	})
	.catch((err) => {
	  res.status(500).send({ message: ms.messages[3].message });
	});
  
  };
  
  // Delete a record with the specified id in the request
  exports.delete = async(req, res) => {
	var ms = await msg('Agent');
	const id = req.params.id;
  
	Table.findByIdAndRemove(id, { useFindAndModify: false })
	  .then((data) => {
		if (!data) {
		  res.status(404).send({
			message: ms.messages[3].message,
		  });
		} else {
		  activity(`${data.name} Lead deleted permanently`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
		  res.send({ message: ms.messages[10].message, });
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[3].message, });
	  });
  };
  
  // Delete all records from the database.
  exports.deleteAll = async(req, res) => {
	var ms = await msg('Agent');
	Table.deleteMany({})
	  .then((data) => {
		activity(`${data.deletedCount} Lead deleted many records permanently`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
		res.send({
		  message: `${data.deletedCount} `+ms.messages[3].message,
		});
	  })
	  .catch((err) => {
		res.status(500).send({
		  message:
			err.message || "Some error occurred while removing all records.",
		});
	  });
  };
  
  exports.trash = async(req, res) => {
	var ms = await msg('Agent');
	  const id = req.params.id;
	  
	  Table.findById(id)
		.then((data) => {
		  if (!data)
			res.status(404).send({ message: ms.messages[3].message });
		  else {
			  Table.findByIdAndUpdate(id, {status : 'Trash', updatedBy: req.headers["user"]}, { useFindAndModify: false })
			  .then((data) => {
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			activity(data.firstname+' Lead trashed successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
			res.send({ message: ms.messages[7].message });
		  }
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[3].message });
			  });
		  }
		})
		.catch((err) => {
		  res.status(500).send({ message: ms.messages[3].message });
		});
  };
  
  exports.restore = async(req, res) => {
	var ms = await msg('Agent');
	  const id = req.params.id;
	  
	  Table.findById(id)
		.then((data) => {
		  if (!data)
			res.status(404).send({ message: ms.messages[3].message });
		  else {
			  
			  Table.findOne({ $or: [{ email: data.email}, { phone: data.phone}], lead: '0', status : { $ne : 'Trash'}}) 
			  .then((e) => {
				  if (e && e.email === data.email) 
					  return res.status(400).send({ message: ms.messages[1].message });
				  else if (e && e.phone === data.phone)
					  return res.status(400).send({ message: ms.messages[2].message });
				else {
						  Table.findByIdAndUpdate(id, {status : 'New', updatedBy: req.headers["user"]}, { useFindAndModify: false })
						  .then((data) => {
							if (!data) {
							  res.status(404).send({ message: ms.messages[3].message});
							} else {
						activity(data.firstname+' Lead restored successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
						res.send({ message: ms.messages[8].message });
					  }
						  })
						  .catch((err) => {
							res.status(500).send({ message: ms.messages[3].message });
						  });
				}
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[3].message });
	  });
		  }
		})
		.catch((err) => {
		  res.status(500).send({ message: ms.messages[3].message });
		});
  };

  exports.exceldoc = async(req, res) => {
	const { search, status } = req.query;
	
	if (search)
	  var condition = { $or: [ { firstname: { $regex: new RegExp(search), $options: "i" } }, { lastname: { $regex: new RegExp(search), $options: "i" } }, { phone: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" }}, { email: { $regex: new RegExp(search), $options: "i" } },] };
	else
	  condition = {};
	condition.status = status ? status : { $ne: 'Trash' };
	
	Table.find(condition)
	.populate('createdBy')
	.populate('updatedBy')
	  .then((data) => {
		let records = [];
  
	  data.forEach((obj) => {
		records.push({
		  
		  firstname: obj.firstname,
		  lastname: obj.lastname,
		  email: obj.email,
		  phone: obj.phone,
		  address: obj.address,
		  address1: obj.address1,
		  status: obj.status,
		  createdBy: obj.createdBy ? obj.createdBy.firstname+' '+obj.createdBy.lastname : '',
		  updatedBy: obj.updatedBy ? obj.updatedBy.firstname+' '+obj.updatedBy.lastname : '',
		  createdAt: obj.createdAt ? obj.createdAt:'',
		  updatedAt: obj.updatedAt ? obj.updatedAt:'',
		});
	  });
  
	  let workbook = new excel.Workbook();
	  let worksheet = workbook.addWorksheet("Records");
  
	  worksheet.columns = [
		
		{ header: "First Name", key: "firstname", width: 20 },
		{ header: "Last Name", key: "lastname", width: 20 },
		{ header: "Phone Number", key: "phone", width: 15 },
		{ header: "E-mail ID", key: "email", width: 20 },
		{ header: "Address", key: "address", width: 20 },
		{ header: "Address1", key: "address1", width: 20 },
		{ header: "Status", key: "status", width: 15 },
		{ header: "Created By", key: "createdBy", width: 15 },
		{ header: "Updated By", key: "updatedBy", width: 15 },
		{ header: "Created On", key: "createdAt", width: 15 },
		{ header: "Updated On", key: "updatedAt", width: 15 },
	  ];
  
	  // Add Array Rows
	  worksheet.addRows(records);
  
	  res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	  );
	  res.setHeader(
		"Content-Disposition",
	  
	"attachment; filename=" + "records.xlsx"
	  );
	  return workbook.xlsx.write(res).then(function () {
		activity(`${req.body.firstname} Leads exported successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.export);
		
		res.status(200).end();
	  });
  
  
	  })
	  .catch((err) => {
		res.status(403).send({
		  message:
			err.message || "Some error occurred while retrieving records.",
		});
	  });
  };