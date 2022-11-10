const db = require("../models");
const Table = db.messages;
const Admin = db.adminusers;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new record
exports.create = async(req, res) => {
	var ms = await msg('messages');
  if (!req.body)    
	return res.status(400).send({ message: ms.messages[3].message });
  Table.findOne({ name: req.body.name, status: { $ne : 'Trash' }})
	.then((data) => {
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: "Message module already exist" });
		else{
		  Table.create(req.body)
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[3].message});
			  } 
			  else {
				  activity(req.body.name+' module. '+ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);	
				  res.send({ message: ms.messages[0].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[2].message });
			});
		} 
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[2].message });		  
	});
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status } = req.query;
  var sortObject = {};
  if (search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
    var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } }] };
  }
  else
    condition = {};
  condition['status'] = status ? status : { $ne : 'Trash'};
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, {  populate: ['createdBy', 'modifiedBy'], offset, limit, sort: sortObject })

    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving records.",
      });
    });
};

// Find a single record with an id
exports.findOne = async(req, res) => {
	var ms = await msg('messages');
	Table.findOne({ name: 'messages'}).then((msg) => {
	  const id = req.params.id;
	  Table.findById(id)
		.populate('createdBy')
		.populate('modifiedBy')
		.then((data) => {
		  if (!data)
			res.status(404).send({ message: ms.messages[2].message });
		  else res.send(data);
		})
		.catch((err) => {
		  res.status(500).send({ message: ms.messages[2].message });
		});
	});
};

// Update a record by the id in the request
exports.update = async(req, res) => {
	var ms = await msg('messages');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[3].message});
  const id = req.params.id; 
  Table.findOne({ name: req.body.name, status: { $ne : 'Trash'}, _id: { $ne : id}})
    .then((data) => {
		//console.log(data);
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: "Message module already exist" });
		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {	
				res.status(404).send({ message: ms.messages[2].message});
			  } 
			  else {	
				  activity(req.body.name+' module. '+ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[1].message});
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[2].message });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[2].message });		  
	});
};

// Find a list record with an id
exports.findList = (req, res) => { 
  const { status } = req.query;
  Table.find({status: status})
    .then((data) => {
      res.send({list: data});
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record"});
    });
};