const db = require("../models");
const Table = db.columns;
const Users = db.adminusers;
const Tradie = db.tradie;
const Team = db.teamusers;

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new record
exports.create = (req, res) => {
  if (!req.body)    
    return res.status(400).send({ message: "Content can not be empty!" });
  Table.findOne({ name: req.body.name, type:req.body.type, status: { $ne : 'Trash' }})
    .then((data) => {
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: "Role already exist" });
		else{
		  Table.create(req.body)
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!'});
			  } 
			  else {			  
				const info = {};
				  Table.find({type: req.body.type}, { name: 1, columns: 1}).then((cursor) => {
					  cursor.forEach(function(doc, err) {
						  info[doc.name] = doc.columns;
					  });
					if(req.body.type === 'Admin'){
					  Users.find({}, { columns: 1 }).then((user) => {
						  user.forEach(function(use, err) {
							  Users.findByIdAndUpdate(use._id, { columns: info }, { useFindAndModify: false }).then();
						  });
					  });
					}
					if(req.body.type === 'Tradie'){
					  Tradie.find({}, { columns: 1 }).then((user) => {
						  user.forEach(function(use, err) {
							  Tradie.findByIdAndUpdate(use._id, { columns: info }, { useFindAndModify: false }).then();
						  });
					  });
					}					
				  });
				  //res.send({ id: data.id, message: "Record was updated successfully." });
				  res.send({ message: "Record was updated successfully." });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: "Error creating record" });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: "Error retrieving record with id=" });		  
	});
};

// Retrieve all records from the database.
exports.findAll = (req, res) => {
  const { page, size, search, field, dir, status } = req.query;
  var sortObject = {};
  var condition = {};
  condition['status'] = status ? status : { $ne : 'Trash'};
  if(search)
  condition['name'] = { $regex: new RegExp(search), $options: "i" };
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, { offset, limit, sort: sortObject })
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
exports.findOne = (req, res) => {
  const id = req.params.id;
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.update = (req, res) => {
  if (!req.body)
    return res.status(400).send({ message: "Data to update can not be empty!"});
  const id = req.params.id; 
  Table.findOne({ name: req.body.name,  type:req.body.type, status: { $ne : 'Trash'}, _id: { $ne : id}})
    .then((data) => {
		//console.log(data);
		if (data && data.name === req.body.name) 
			return res.status(400).send({ message: "Role already exist" });
		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {	
				res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!'});
			  } 
			  else {			  
				const info = {};
				  Table.find({type: req.body.type}, { name: 1, columns: 1}).then((cursor) => {
					  cursor.forEach(function(doc, err) {
						  info[doc.name] = doc.columns;
					  });
					if(req.body.type === 'Admin'){
					  Users.find({}, { columns: 1 }).then((user) => {
						  user.forEach(function(use, err) {
							  Users.findByIdAndUpdate(use._id, { columns: info }, { useFindAndModify: false }).then();
						  });
					  });
					}
					if(req.body.type === 'Tradie'){
					  Tradie.find({}, { columns: 1 }).then((user) => {
						  user.forEach(function(use, err) {
							  Tradie.findByIdAndUpdate(use._id, { columns: info }, { useFindAndModify: false }).then();
						  });
					  });
					}					
				  });
				  res.send({ message: "Record was updated successfully." });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: "Error updating record with id=" + id });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: "Error retrieving record with id=" + id });		  
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