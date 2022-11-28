const db = require("../models");
const Table = db.mailbox;
const Admin = db.adminusers;
const Setting = db.settings;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => {
	var ms = await msg('Mailbox');
	if (!req.body.email)    
	  return res.status(400).send({ message: ms.messages[0].message });
		req.body.email = req.body.email.trim();
	  var email = req.body.email;
	  Table.findOne({ $or: [{ email: email}], status : { $ne : 'Trash'}})
	  .then((data) => {
		  if (data && data.email === email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else{			  
			  Table.create(req.body)
			  .then(async(data) => { 
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			activity(`${req.body.email} Mailbox created successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
			res.send({ message: ms.messages[5].message, id:data._id });
		}
			  })
			  .catch((err) => {
				  console.log(err);
				res.status(500).send({ message: ms.messages[4].message });
			  });
	  }
	}).catch((err) => {
	  res.status(500).send({ message: ms.messages[4].message });
	});
		  
  };

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status } = req.query;
  var sortObject = {};
  if(search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
  var condition = { $or: [{ email: { $regex: new RegExp(search), $options: "i" }}, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } } ]};
  }
  else
  condition = {};

  condition.status = status ? status : { $ne : 'Trash'};

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
	var ms = await msg('Mailbox');
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
exports.findList = async(req, res) => {
	
	var ms = await msg('Mailbox');
	Table.find({status:'Active'}).sort({default: -1})
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
	var ms = await msg('Mailbox');
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
	var ms = await msg('Mailbox');
	if (!req.body)
	  return res.status(400).send({ message: ms.messages[0].message});
	const id = req.params.id; 
	Table.findOne({ $or: [{ email: req.body.email}, { phone: req.body.phone}], status : { $ne : 'Trash'}, _id: { $ne : id}})
	  .then(async(data) => {
		  if (data && data.email === req.body.email) 
			  return res.status(400).send({ message: ms.messages[1].message });
		  else{
		const olddata = await Table.findById(id); 
			await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			  .then(async(data) => {
				if (!data) {
				  res.status(404).send({ message: 'gdfgdf'});
				} else {
		   
			activity(`${req.body.email} mailbox updated successfully`, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
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
  
  exports.updateColumns = async(req, res) => {
	var ms = await msg('Mailbox');
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
	var ms = await msg('Mailbox');
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
	var ms = await msg('Mailbox');
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
	var ms = await msg('Mailbox');
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
  
  exports.setdefault = async(req, res) => {
	var ms = await msg('Mailbox');
	  const id = req.params.id; 
	  
	  Table.findById(id)
		.then(async(data) => {
		  if (!data)
			res.status(404).send({ message: ms.messages[3].message });
		  else {
			  await Table.updateMany({}, {default : 0, updatedBy: req.headers["user"]}, { useFindAndModify: false });
			  await Table.findByIdAndUpdate(id, {default : 1, updatedBy: req.headers["user"]}, { useFindAndModify: false })
			  .then((data) => {
				if (!data) {
				  res.status(404).send({ message: ms.messages[3].message});
				} else {
			activity(data.email+' mail set as default successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
			res.send({ message: ms.messages[2].message });
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