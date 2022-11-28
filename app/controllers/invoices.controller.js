const db = require("../models");
const Table = db.invoices;
const Admin = db.adminusers;
const Setting = db.settings;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
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
  const id = req.params.id;
//   Table.findOne({ $or: [{ name: req.body.name}], status: { $ne:'Trash' } })
//     .then((data) => {
// 		if (data && data.name === req.body.name)
// 			return res.status(400).send({ message:ms.messages[1].message });
// 		else{
			req.body.uid =  'IN' + Autoid;
			 Table.create(req.body)
			.then(async(data1) => {
			  if (!data1) {
				res.status(404).send({ message: ms.messages[1].message});
			  } else {
          activity(req.body.name+' module. '+ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
		  await Setting.findByIdAndUpdate(settings_id, { invoice: set.invoice + 1 }, { useFindAndModify: false });
          res.send({ message: ms.messages[0].message });
      }
			})
			.catch((err) => {
			  res.status(500).send({ message:ms.messages[1].message});
			});
//     }
//   })
//   .catch((err) => {
//   res.status(500).send({ message: ms.messages[1].message });
// });
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
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'job', 'quote'], offset, limit, sort: sortObject })
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
    .populate('quote')
    .populate('tradie')
    .populate('job')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};


// Update a record by the id in the request
exports.update = async(req, res) => {
  var ms = await msg('invoices');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[3].message});
  const id = req.params.id;

//   Table.findOne({ $or: [{ name: req.body.name}], _id: { $ne : id}})
//     .then((data) => {
// 		if (data && data.name === req.body.name)
// 			return res.status(400).send({ message: ms.messages[3].message });

// 		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[3].message + err});
			  }
			  else {
				activity(ms.messages[2].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[2].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[3].message + err});
			});
	// 	}
    //   })
	//   .catch((err) => {
    //   res.status(500).send({ message: ms.messages[3].message + err});
	// });
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
