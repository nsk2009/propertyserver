const db = require("../models");
const Table = db.usa_cities;
const States = db.usa_states;
const Admin = db.adminusers;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async (req, res) => {

  var ms = await msg('cities');

  if (!req.body)
    return res.status(400).send({ message: ms.messages[0].message });

  Table.findOne({ name: req.body.name, state_id: req.body.state_id, status: { $ne: 'Trash' } })
    .then(data => {
      if (data)
        return res.status(404).send({ message: ms.messages[1].message });
      else {
        Table.create(req.body)
          .then(data => {
            activity(req.body.name + ' module. ' + ms.messages[2].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
            res.send({ message: ms.messages[2].message });
          })
          .catch((err) => {
            res.status(400).send({ message: ms.messages[3].message });
          });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: ms.messages[0].message });
    });
};

// Retrieve all records from the database.
exports.findAll = async (req, res) => {

  var ms = await msg('cities');
  const { page, size, search, field, dir, status, state, show } = req.query;
  var sortObject = {};

  if (search) {
    var Statesn = await States.find({ status : { $ne : 'Trash'}, name: { $regex: new RegExp(search), $options: "i" }});
    const info1 = [];
    Statesn.forEach(function(doc, err) {
      info1.push(doc._id);
    });
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info2 = [];
	  users.forEach(function (doc, err) {
		info2.push(doc._id);
	  });
    var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { status: { $regex: new RegExp(search), $options: "i" } }, { state_id : { $in: info1 } }, { modifiedBy: { $in: info2 } }, { createdBy: { $in: info2 } }] };
  }
  else
    condition = {};
  condition.status = status ? status : { $ne: 'Trash' };

  if(state) 
    condition.state_id = state;
  
  if(show) condition.show = show;

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: [{ path: "createdBy", select: ["firstname", "lastname"] }, { path: "state_id", select: "name" }, { path: "modifiedBy", select: ["firstname", "lastname"] },], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.send({ message: ms.messages[4].message });
    });
};

// Retrieve all records from the database.
exports.findCities = async (req, res) => {

	var ms = await msg('states');
  const { id } = req.params;
	Table.find({ status: "Active", state_id : id }).sort({ name: 1 })
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

// Retrieve records only status "Active" & show "yes".
exports.findList = async (req, res) => {

  var ms = await msg('cities');
  const { show, status } = req.query;
  var { id } = req.params;

  Table.find({ state_id: id, show: show, status: status })
    .sort({ name: 1 })
    .then((data) => {
      res.send({ list: data });
    })
    .catch((err) => {
      res.send({ message: ms.messages[4].message });
    });

};

// Find a single record with an id
exports.findOne = async (req, res) => {

  const id = req.params.id;
  var ms = await msg('cities');

  Table.findById(id).populate({ path: "createdBy", select: ["firstname", "lastname"] }).populate({ path: "modifiedBy", select: ["firstname", "lastname"] }).populate({ path: "state_id", select: ["name", "abbreviation"] })
    .then(data => {
      if (!data)
        res.status(404).send({ message: ms.messages[5].message });
      else
        res.send(data);
    })
    .catch((err) => {
      res.status(404).send({ message: ms.messages[4].message });
    });
};


// Update a record by the id in the request
exports.update = async (req, res) => {

  const id = req.params.id;
  var ms = await msg('cities');

  if (!req.body)
    return res.status(400).send({ message: ms.messages[0].message });

  Table.findOne({ name: req.body.name, state_id: req.body.state_id, _id: { $ne: id } })
    .then(data => {
      if (data)
        return res.status(400).send({ message: ms.messages[1].message });
      else {
        Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
          .then(data => {
            activity(ms.messages[6].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
            res.status(200).send({ message: ms.messages[6].message });
          })
          .catch((err) => {
            res.status(400).send({ message: ms.messages[7].message });
          });
      }
    })
    .catch((err) => {
      res.status(400).send({ message: ms.messages[0].message });
    });
};

exports.trash = async (req, res) => {
  var ms = await msg('cities');
  const id = req.params.id;

  Table.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: ms.messages[4].message });
      else {
        Table.findByIdAndUpdate(id, { status: 'Trash' }, { useFindAndModify: false })
          .then(data => {
            activity(ms.messages[8].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
            res.send({ message: ms.messages[8].message });
          })
          .catch((err) => {
            res.status(400).send({ message: ms.messages[9].message });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[5].message });
    });
};