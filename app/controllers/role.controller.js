const db = require("../models");
const Table = db.role;
const Admin = db.adminusers;
const excel = require("exceljs");
const msg = require("../middleware/message");
const activity = require("../middleware/activity");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new record
exports.create = async(req, res) => {
	var ms = await msg('roles');
  // Validate request
  //console.log(req.body);
  if (!req.body)    
    return res.status(400).send({ message: ms.messages[3].message });
  Table.findOne({ name: req.body.name, status: { $ne : 'Trash' }, type : req.body.type})
    .then((data) => {
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: ms.messages[2].message });
		else{
		  Table.create(req.body)
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[9].message});
			  } else {
				activity(ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
				  res.send({ message: ms.messages[0].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[9].message });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[10].message });		  
	});
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
	var ms = await msg('roles');
  const { page, size, search, field, dir, status, type } = req.query;
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
    var condition = {};
  condition['status'] = status ? status : { $ne : 'Trash'};
  condition['type'] = type;
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, { populate: ['createdBy', 'modifiedBy'], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message });
    });
};

// Retrieve all trash records from the database.
exports.trashAll = async(req, res) => {
	var ms = await msg('roles');
  const { page, size, search, field, dir, type } = req.query;
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
    var condition = {};
  condition['status'] = 'Trash';
  condition['type'] = type;
  sortObject[field] = dir;

  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, { populate: ['createdBy', 'modifiedBy'], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message });
    });
};

// Find a single record with an id
exports.findOne = async(req, res) => {
	var ms = await msg('roles');
  const id = req.params.id;
  
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .then((data) => {
      if (!data)
        res.status(404).send({ message: ms.messages[9].message });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message });
    });
};

// Update all records from the database.
exports.updateAll = async(req, res) => {
	var ms = await msg('roles');
  const { ids, status } = req.query;
  Table.updateMany(
   { _id: { $in: JSON.parse(ids) } },
   { $set: { status : status } })
    .then((data) => {
	activity(ms.messages[7].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.updateAll);
      res.send({ message: ms.messages[7].message }); })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[9].message }); });
};

// Update a record by the id in the request
exports.update = async(req, res) => {
	var ms = await msg('roles');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[3].message });
  const id = req.params.id; 
  Table.findOne({ name: req.body.name, status: { $ne : 'Trash'}, _id: { $ne : id}, type : req.body.type})
    .then((data) => {
		//console.log(data);
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: ms.messages[2].message });
		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[9].message});
			  } else {
				activity(ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				res.send({ message: ms.messages[1].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[9].message });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[10].message });		  
	});
};

// Find a list record with an id
exports.findList = async(req, res) => { 
  const { status, type } = req.query;
  Table.find({status: status, type : type})
    .then((data) => {
      res.send({list: data});
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message });
    });
};

// Delete a record with the specified id in the request
exports.delete = async(req, res) => {
	var ms = await msg('roles');
  const id = req.params.id;

  Table.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: ms.messages[9].message });
      } else {
		activity(ms.messages[8].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
        res.send({ message: ms.messages[8].message });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message });
    });
};

// Delete all records from the database.
exports.deleteAll = (req, res) => {
  Table.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} records were deleted successfully!`,
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
	var ms = await msg('roles');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[9].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Trash'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[9].message});
			  } else {
				activity(ms.messages[4].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
				res.send({ message: ms.messages[4].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[9].message });
			});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[10].message });
	  });
};

exports.restore = async(req, res) => {
	var ms = await msg('roles');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[9].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Active'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[9].message});
			  } else {
				activity(ms.messages[6].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
				res.send({ message: ms.messages[6].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[9].message });
			});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[10].message });
	  });
};
  
exports.exceldoc = async(req, res) => {

  var ms = await msg('roles');
  const {search, field, dir, status, type } = req.query;
  var sortObject = {};
  var condition = {};
  condition['status'] = status ? status : { $ne : 'Trash'};
  if(search)
  condition['name'] = { $regex: new RegExp(search), $options: "i" };
  condition['type'] = type;
  sortObject[field] = dir;

  Table.find(condition)
    .sort(sortObject)
    .then((data) => {
		let records = [];

    data.forEach((obj) => {
      records.push({
        name: obj.name,
        status: obj.status,
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Records");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Status", key: "status", width: 25 },
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

	activity("Export all the roles data into Excel file.", req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.export);
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });


    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};