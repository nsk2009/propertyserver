const db = require("../models");
const Table = db.notes;
const excel = require("exceljs");
const msg = require("../middleware/message");
const activity = require("../middleware/activity");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

// Create and Save a new record
exports.create = async (req, res) => {
  var ms = await msg('notes');
  Table.create(req.body)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!' });
      } else {
        activity('Notes added successfully', data._id, 'admin', req.session.useragent, req.session.useragent.create);	
        res.send({ message: ms.messages[0].message });
    }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[2].message });
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

// Retrieve all records from the database.
exports.findAll = async (req, res) => {
  const id = req.params.id;
  const { page, size, status } = req.query;
  const { limit, offset } = getPagination(page, size);
  Table.paginate({to : id, status : 'Active'}, { collation: { locale: "en" }, populate: [{ path : 'createdBy', select : {'firstname' : 1,'lastname' : 1 } }], offset, limit, sort: {'createdAt' : -1} })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving records.",
      });
    });
};

// Update a record by the id in the request
exports.update = async (req, res) => {
  var ms = await msg('notes');
  if (!req.body)
    return res.status(400).send({ message: "Data to update can not be empty!" });
  const id = req.params.id;
        Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
          .then((data) => {
            if (!data) {
              res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!' });
            } else {
              activity('Notes updated successfully', data._id, 'admin', req.session.useragent, req.session.useragent.edit);	
              res.send({ message: ms.messages[1].message });
          }
          })
          .catch((err) => {
            res.status(500).send({ message: "Error updating record with id=" + id });
          });
};

exports.trash = async(req, res) => {
  const id = req.params.id;
  var ms = await msg('notes');
  Table.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else {
        Table.findByIdAndUpdate(id, { status: 'Trash' }, { useFindAndModify: false })
          .then((data) => {
            if (!data) {
              res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!' });
            } else {
              activity('Notes has been deleted successfully', data._id, 'admin', req.session.useragent, req.session.useragent.delete);	
              res.send({ message: ms.messages[4].message });
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