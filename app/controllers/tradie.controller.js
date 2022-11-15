const db = require("../models");
const Table = db.tradie;
const Setting = db.settings;
const Admin = db.adminusers;
const Columns = db.columns;
const Job = db.jobs;
const Quote = db.quotes;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
const excel = require("exceljs");
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
const email = require("../middleware/email");
var bcrypt = require("bcryptjs");
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => {
	var ms = await msg('Customer');
	var set = await Setting.findById(settings_id).then();
	var Autoid = sprintf('%01d', set.tradies);
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
			if(req.files.bcertificate)
  				req.body.businesscertificate = req.files.bcertificate[0].filename;
			if(req.files.lcertificate)
  				req.body.liabilitycertificate = req.files.lcertificate[0].filename;	
			const info = {};
			Columns.find({type: 'Tradie'}, { name: 1, columns: 1 }).then(async(cursor) => {
				//console.log(cursor);
			  cursor.forEach(function(doc, err) {
				  info[doc.name] = doc.columns;
			  });
			  req.body.columns = info;
				req.body.property = set.property;
				req.body.tradie = set.tradie;
				req.body.uid =  'TRD' + Autoid;
				req.body.role='6331845dd7919d3e64b0902d';
			  Table.create(req.body)
			  .then(async(data) => { 
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			activity(`${req.body.name} Tradie created successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
			await Setting.findByIdAndUpdate(settings_id, { tradies: set.tradies + 1 }, { useFindAndModify: false });
			res.send({ message: ms.messages[5].message, id: data._id });
			
		}
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[4].message });
			  });
			});
	  }
	}).catch((err) => {
	  res.status(500).send({ message: ms.messages[4].message });
	});
		  
  };

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status, show, type } = req.query;
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
  if(type) condition.type = type;

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy','tcreatedBy', 'tmodifiedBy'], offset, limit, sort: sortObject })
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

exports.findList = async(req, res) => {
	Table.find({status:"Active"})
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
}

// Find a single record with an id
exports.findOne = async(req, res) => {
	var ms = await msg('Customer');
	const id = req.params.id;
	const ip = req.headers['x-forwarded-for'];
	Table.findById(id)
	  .populate('createdBy')
	  .populate('updatedBy')
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
	const jobs = await Job.find({tradie: id});  
	const quotes = await Quote.find({tradie: id}); 
	res.send({data:data, jobs: jobs, quotes: quotes});
  };
  
  // Update all records from the database.
  exports.updateAll = async(req, res) => {
	var ms = await msg('Customer');
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
	var ms = await msg('Customer');
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
		if(req.files.bcertificate){
			fs.unlinkSync(__basedir+'/uploads/'+olddata.businesscertificate);
  			req.body.businesscertificate = req.files.bcertificate[0].filename;
		}
		if(req.files.lcertificate){
			fs.unlinkSync(__basedir+'/uploads/'+olddata.liabilitycertificate);
  			req.body.liabilitycertificate = req.files.lcertificate[0].filename;
		}
			await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			  .then(async(data) => {
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
		   
			activity(`${req.body.firstname} Lead updated successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
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

   // Morgin a record by the id in the request
   exports.morgin = async(req, res) => {
	var ms = await msg('Customer');
	if (!req.body)
	  return res.status(400).send({ message: ms.messages[0].message});
	const id = req.params.id;

		
			await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			  .then(async(data) => {
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			res.send({ message: ms.messages[6].message });
		  }
			  })
			  .catch((err) => {
				res.status(500).send({ message: ms.messages[3].message });
			  });
  };
  
  exports.updateColumns = async(req, res) => {
	var ms = await msg('Customer');
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
	var ms = await msg('Customer');
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
	var ms = await msg('Customer');
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
	var ms = await msg('Customer');
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
	var ms = await msg('Customer');
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

exports.findAllHistory = async (req, res) => {
	const id = req.params.id;
	const tradie = await Table.findById(id).populate({ path: 'createdBy', select: ['firstname', 'lastname'] }).populate({ path: 'modifiedBy', select: ['firstname', 'lastname'] });
	//const job = await Job.find({tradie:id}).populate({ path: 'customer', select: ['firstname', 'lastname'] }).populate({ path: 'createdBy', select: ['firstname', 'lastname'] }).populate({ path: 'modifiedBy', select: ['firstname', 'lastname'] });
	const jobs = await Job.find({tradie: id});  
	const quotes = await Quote.find({tradie: id}); 
	res.send({
		tradie: tradie,
		job: jobs,
		quotes: quotes,
	  });
}

exports.sendKey = async(req, res, next) => {
	var ms = await msg('login');
	const id = req.params.id;
	Table.findById(id)
	  .then(async(data) => {
		  if (!data)
			  return res.status(400).send({ message: ms.messages[0].message });
		  else{
		await email('6373770854d8e5dda7f9e13f', 'admin', {'{name}': data.name +' '+ data.companyname, '{email}': data.email, '{link}': `${customerLink}register/${data.id}`});  
				  return res.status(200).send({message: 'Activation link send to particular mail address', email:data.email});
		}
		})
		.catch((err) => {
		  res.status(500).send({ message: "Error retrieving record" });		  
	  });
  };
  
  
// Create Password a record by the id in the request
exports.createpassword = (req, res) => {
	if (!req.body)
	  return res.status(400).send({ message: "Data to update can not be empty!" });
	const id = req.params.id;
	Table.findById(id)
	  .then((data) => {
		const saltRounds = 10;
		const myPlaintextPassword = req.body.password;
  
		bcrypt.genSalt(saltRounds, function (err, salt) {
		  bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
			Table.findByIdAndUpdate(id, { password: hash, status: 'Active' }, { useFindAndModify: false })
			  .then(async(data) => {
  
				if (!data) {
				  res.status(404).send({ message: err });
				}
				else {
				 // await email('629489cbfabff6261014f1fc', 'admin', {'{name}': data.name, '{email}': data.email, '{link}': `${cmsLink}`});  
				//   activity('update#' + data.name + ' User password has been created successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.password);
				  res.send({ message: "User password has been created successfully" });
				}
			  })
			  .catch((err) => {
				res.status(500).send({ message: err + id });
			  });
		  });
		});
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Error retrieving record with id=" + id });
	  });
  };