const db = require("../models");
const Table = db.settings;
const Dateformat = db.dateformat;
const Timezone = db.timezone;
const Emailapi = db.emailapi;
const Smsapi = db.smsapi;
const Paymentapi = db.accountingapis;
const Transactions = db.transactions;
const activity = require("../middleware/activity");
var fs = require('fs');

// Find a single record with an id
exports.findOne = async(req, res) => {
	//await Dateformat.deleteMany({});
	//DD/MM/YYYY
//MMMM Do, YYYY
//DD-MM-YYYY
//MMMM DD, YYYY
	/*await Dateformat.create({script: 'DD/MM/YYYY'});
	await Dateformat.create({script: 'DD-MM-YYYY'});
	await Dateformat.create({script: 'MMMM DD, YYYY'});
	await Dateformat.create({script: 'MMMM Do, YYYY'});*/
	const dates = await Dateformat.find();
	const times = await Timezone.find();
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send({data: data, dateformats: dates, timezones: times});
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving record with id=" + id });
    });
};

// Find a single record with an id
exports.findLogo = async(req, res) => {
  
  const dates = await Dateformat.find();
  const times = await Timezone.find();
  const id = req.params.id;

  Table.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found record with id " + id });
      else res.send({logo: data.logo, dateformats: dates, timezones: times});
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving record with id=" + id });
    });
};

// Update a record by the id in the request
exports.update = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  //console.log(req.file);
  var set = await Table.findById(id);
  if(req.file){
	  fs.unlinkSync(__basedir+'/uploads/'+set.logo);
  req.body.logo = req.file.filename;
  }
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
		const logo = req.file ? req.file.filename : data.logo;
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } 
	  else {
		  //console.log(req.socket.remoteAddress);
		  //console.log(req.connection.remoteAddress);
      activity( data.title + ' Details has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
      res.send({ logo: logo, message: "Record was updated successfully." });
  }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};

// Find a single record with an id
exports.findemailapi = async(req, res) => {
  const id = req.params.id;
  //await Emailapi.create({user: id}).then();
  Emailapi.findOne({user: id})
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
exports.updateemailapi = (req, res) => {
  const id = req.params.id;
  Emailapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else res.send({ message: "Record was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};
// Find a single record with an id
exports.findsmsapi = async(req, res) => {
   const id = req.params.id;
  //await Smsapi.create({user: id}).then();
  Smsapi.findOne({user: id})
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
exports.updatesmsapi = (req, res) => {
  const id = req.params.id;
  Smsapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else {
        activity( data.title + ' SMS API has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
        res.send({ message: "Record was updated successfully." });
    }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};
// Find a single record with an id
exports.findpaymentapi = async(req, res) => {
  const id = req.params.id;
  //await Paymentapi.create({user: id}).then();
  Paymentapi.findOne({user: id})
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
exports.updatepaymentapi = (req, res) => {
  const id = req.params.id;
  Paymentapi.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update record with id=${id}. Maybe record was not found!`, });
      } else {
        activity( data.title + ' Payment API has been updated Successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
        res.send({ message: "Record was updated successfully." });
    }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error updating record with id=" + id, });
    });
};

exports.findInvoice = async (req, res) => {
  const { id } = req.params;
  const logo = await Table.findOne({_id: '6275f6aae272a53cd6908c8d'});
  Transactions.findOne({_id:id,type:'Subscription'}).populate('sub_id').populate('customer_id')
    .then(data => {
      if (!data)
        return res.status(404).send({ message: "No record found!" });
      res.status(200).send({logo : logo.logo, data: data});
    })
    .catch(err => {
      res.status(400).send({ message: "Invalid Customer id" });
    })
};