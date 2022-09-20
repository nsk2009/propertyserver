const db = require("../models");
const Table = db.usa_states;
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
  const result = await Table.find({status: { $ne: 'Trash'} });
  var ms = await msg('states');
  if (!req.body)
    return res.status(400).send({ message:ms.messages[0].message });
  const id = req.params.id;
  Table.findOne({ $or: [{ name: req.body.name}, {abbreviation:req.body.abbreviation}], status: { $ne:'Trash' } })
    .then((data) => {
		if (data && data.name === req.body.name)
			return res.status(400).send({ message:ms.messages[1].message });
		if (data && data.abbreviation === req.body.abbreviation)
			return res.status(400).send({ message:ms.messages[2].message });
		else{
			 Table.create(req.body)
			.then((data1) => {
			  if (!data1) {
				res.status(404).send({ message: ms.messages[0].message});
			  } else {
          activity(req.body.name+' module. '+ms.messages[3].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
          res.send({ message: ms.messages[3].message });
      }
			})
			.catch((err) => {
			  res.status(500).send({ message:ms.messages[0].message});
			});
    }
  })
  .catch((err) => {
  res.status(500).send({ message: ms.messages[1].message });
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
    .populate('role')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid customer id"});
    });
};


// Update a record by the id in the request
exports.update = async(req, res) => {
  var ms = await msg('states');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[0].message});
  const id = req.params.id;

  Table.findOne({ $or: [{ name: req.body.name}, {abbreviation: req.body.abbreviation}], _id: { $ne : id}})
    .then((data) => {
		if (data && data.name === req.body.name)
			return res.status(400).send({ message: ms.messages[1].message });

		if (data && data.abbreviation === req.body.abbreviation)
			return res.status(400).send({ message: ms.messages[2].message });

		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[0].message + err});
			  }
			  else {
				activity(ms.messages[4].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[4].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[0].message + err});
			});
		}
      })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[0].message + err});
	});
};

exports.trash = async(req, res) => {
	var ms = await msg('states');
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
  var ms = await msg('states');
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
