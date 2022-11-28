const db = require("../models");
const Table = db.quotes;
const Admin = db.adminusers;
const Setting = db.settings;
const TradieTable = db.tradie;
const enquiryTable = db.enquiry;
const Note = db.notes;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
//Required package
var pdf = require("pdf-creator-node");
var juice = require('juice');
var fs = require("fs");
const email = require("../middleware/email");
const gethtml = require("../middleware/pdfhtml");
var css = fs.readFileSync("quote.css", "utf8");
	
// Read HTML Template
// var html = fs.readFileSync("template.html", "utf8");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};


// Create and Save a new record
exports.create = async(req, res) => {
//   const result = await Table.find({status: { $ne: 'Trash'} });
  var set = await Setting.findById(settings_id).then();
  var Autoid = sprintf('%01d', set.quotes);
  var ms = await msg('quotes');
  if (!req.body)
    return res.status(400).send({ message:ms.messages[1].message });
//   const id = req.params.id;
//   req.body.quote_date=req.body.quote_date.toJSON().slice(0, 10).replace(/-/g, '-');
//   req.body.expiry_date=req.body.expiry_date.toJSON().slice(0, 10).replace(/-/g, '-');
//   Table.findOne({ $or: [{ name: req.body.name}], status: { $ne:'Trash' } })
//     .then((data) => {
// 		if (data && data.name === req.body.name)
// 			return res.status(400).send({ message:ms.messages[1].message });
// 		else{
			req.body.uid="QT" + Autoid;
			// return res.status(400).send(req.body);
			req.body.history = [];
			await Table.create(req.body)
			.then(async(data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[1].message});
			  } else {
				if(req.body.enquiry){
					const enq= await enquiryTable.findById(req.body.enquiry);
					var responsed_tradies = enq.responsed_tradies ?enq.responsed_tradies:[];
					responsed_tradies.push(req.body.tradie);
					await enquiryTable.findByIdAndUpdate(req.body.enquiry, {responsed_tradies:responsed_tradies}, {useFindAndModify:false});
				}
          activity(req.body.name+' module. '+ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
		  await Setting.findByIdAndUpdate(settings_id, { quotes: set.quotes + 1 }, { useFindAndModify: false }); 
		  res.send({ message: ms.messages[0].message, id: data._id });
      		}
			})
			.catch((err) => {
			  res.status(500).send(err);
			});
    // }
//   })
//   .catch((err) => {
//   res.status(500).send({ message: ms.messages[1].message });
// });
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  const { page, size, search, field, dir, status, show, tradie } = req.query;
  var sortObject = {};
  var admins = [];
  var ads = await Admin.find({ status : { $ne : 'Trash'}});
  ads.forEach((e)=>{
	admins.push(e._id);
  });
  if(search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
  if(tradie){
  var condition = { $or: [{ uid: { $regex: new RegExp(search), $options: "i" }}, { abbreviation: { $regex: new RegExp(search), $options: "i" }}, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } }]};
	   condition.tradie = tradie;
  }
  else
  var condition = { $or: [{ uid: { $regex: new RegExp(search), $options: "i" }}, { abbreviation: { $regex: new RegExp(search), $options: "i" }}, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } },  { createdBy: { $in: admins } }, {status:{$ne:'Draft'}} ]};
  }
  else{
	if(tradie){
	var condition = { };
	   condition.tradie = tradie;
	}
	else
    var condition = { $or: [ { createdBy: { $in: admins } }, {status:{$ne:'Draft'}} ]};
  }
  condition.status = status ? status : { $ne : 'Trash'};

  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'tradie', 'enquiry'], offset, limit, sort: sortObject })
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

// Retrieve all state records from the database.
exports.findCusList = async(req, res) => {
  const id = req.params.id;
	const { status } = req.query;
	Table.find({customer: id, status: "Approved"})
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
  var ms = await msg('quotes');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};

// Find a single record with an id
exports.details = async(req, res) => {
  const id = req.params.id;
  var ms = await msg('quotes');
  const notes = await Note.find({ quote: id}).sort({ _id: -1 }).populate('createdBy');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send({data: data, notes: notes});
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};

// approve a quote
exports.approve = async(req, res) => {
	const id = req.params.id;
	const status = req.params.status;
	var ms = await msg('quotes');
	Table.findById(id)
	  .populate('createdBy')
	  .populate('modifiedBy')
	  .populate('customer')
	  .then(async(data) => {
		if (!data)
		res.status(404).send({ message: "OK"});
		else {
			//if(data.enquiry) await Table.updateMany({enquiry:data.enquiry}, {status:"Declined"}, {useFindAndModify:false});
			await Table.findByIdAndUpdate(id, {status:status,tstatus:status}, {useFindAndModify:false});
			//if(data.enquiry)  await enquiryTable.findByIdAndUpdate(data.enquiry, {movedtoquote:1}, {useFindAndModify:false});
			if(data.tradie){
				const tradieDet = await TradieTable.findById(data.tradie);
				await email('63786d08b055c0628e7e32d3', 'admin', {'{name}': tradieDet.name, '{email}': tradieDet.email, '{link}': `${cmsLink}`, '{quote}':data.uid});
			}
			res.send({message:"Quote has been approved successfully"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid quote id"});
	  });
  };
  

// Update a record by the id in the request
exports.update = async(req, res) => {
  var ms = await msg('quotes');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[3].message});
  const id = req.params.id;
//   req.body.quote_date=req.body.quote_date.toJSON().slice(0, 10).replace(/-/g, '-');
//   req.body.expiry_date=req.body.expiry_date.toJSON().slice(0, 10).replace(/-/g, '-');

//   Table.findOne({ $or: [{ name: req.body.name}], _id: { $ne : id}})
//     .then((data) => {
// 		if (data && data.name === req.body.name)
// 			return res.status(400).send({ message: ms.messages[1].message });

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
		// }
    //   })
	//   .catch((err) => {
    //   res.status(500).send({ message: ms.messages[0].message + err});
	// });
};


// Revise a record by the id in the request
exports.revise = async(req, res) => {
  var ms = await msg('quotes');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[3].message});
  const id = req.params.id;
//   req.body.quote_date=req.body.quote_date.toJSON().slice(0, 10).replace(/-/g, '-');
//   req.body.expiry_date=req.body.expiry_date.toJSON().slice(0, 10).replace(/-/g, '-');

//   Table.findOne({ $or: [{ name: req.body.name}], _id: { $ne : id}})
//     .then((data) => {
// 		if (data && data.name === req.body.name)
// 			return res.status(400).send({ message: ms.messages[1].message });

// 		else{
	      var revise = await Table.findOne({_id: id});
		  let history = revise.history;
		  let info ={			  
			taxtype: revise.taxtype,
			taxrate: revise.taxrate,
			taxid: revise.taxid,
			taxname: revise.taxname,
			subtotal: revise.subtotal,
			grosstotal: revise.grosstotal,
			discamt: revise.discamt,
			taxamt: revise.taxamt,
			total: revise.total,
			customer: revise.customer,
			tradie: revise.tradie,
			quote_date: revise.quote_date,
			expiry_date: revise.expiry_date,
			description: revise.description,
			terms: revise.terms,
			discount: revise.discount,
			distype: revise.distype,
			tax: revise.tax,
			items: revise.items,
			modifiedBy: revise.modifiedBy,
			updatedAt: revise.updatedAt
		  } 
		  history.push(info);
		  req.body.history = history;
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
		// }
    //   })
	//   .catch((err) => {
    //   res.status(500).send({ message: ms.messages[0].message + err});
	// });
};

exports.trash = async(req, res) => {
	var ms = await msg('states');
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
  var ms = await msg('quotes');
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
// var html = "<!DOCTYPE html> <html>  <head>	<meta charset='utf-8' /><title>Hello world!</title>  </head>  <body>	<h1>User List</h1><ul>{{#each users}}<li>Name: {{this.name}}</li><li>Age: {{this.age}}</li><br />{{/each}}</ul></body></html>"
// Find a single record with an id
exports.generatePdf = async(req, res) => {
	const {id, html} = req.body;
	var content = juice(`<style>${css}</style>${html}`);	
	var options = {
        format: "A4",
        orientation: "portrait",
        border: "1mm",
        header: {
            height: "40mm",
            contents: '<div style="text-align: center;"><img src="https://salesplanner.org/demo/property/server/uploads/1664349489012-logo_.png" alt="logo" /></div>'
        },
        footer: {
            height: "5mm",
            contents: {
                first: 'Cover page',
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    };


	  var document = {
		html: content,
		data: {
		  
		},
		path: `./invoices/${id}.pdf`,
		type: "",
	  };
	pdf
  .create(document, options)
  .then((data) => {
	res.send(data.filename);
  })
  .catch((error) => {
    console.error(error);
  });
  };
  // Send a quote to the customer
  exports.sendQuoteToCustomer = async(req, res) => {
	const id = req.params.id;
	var ms = await msg('quotes');
	Table.findById(id)
	  .populate('createdBy')
	  .populate('modifiedBy')
	  .populate('customer')
	  .then(async(data) => {
		if (!data)
		res.status(404).send({ message: "OK"});
		else {
			//const text = await gethtml.quotehtml();
			await Table.findByIdAndUpdate(id, {message:req.body.message, status:'Awaiting Client Approval', tstatus: 'Awaiting Client Approval'}, {useFindAndModify:false});
			await email('6378b084b055c0628e7e32d9', 'admin', {'{subject}': req.body.subject, '{message}': req.body.message,'{email}': data.customer.email, '{link}': `${cmsLink}`, '{attachment}':'https://salesplanner.org/demo/property/server/uploads/1663415591197-stock-photo-1052601383.jpg'});
			await Table.findByIdAndUpdate(id, {senttocustomer:1}, {useFindAndModify:false});
			res.send({message:"Quote has been sent to customer!"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid quote id"});
	  });
  };
  
    // Send a quote to the Admin
exports.sendToAdmin = async(req, res) => {
	const id = req.params.id;
	var ms = await msg('quotes');
	Table.findById(id)
	  .then(async(data) => {
		if (!data)
		res.status(404).send({ message: "OK"});
		else {
			const admin = await Admin.findById('61efce935f2e3c054819a02f');
			await Table.findByIdAndUpdate(id, {message:req.body.message, status:'Pending', tstatus: 'Sent to Admin'}, {useFindAndModify:false});
			//const text = await gethtml.quotehtml();
			 await email('637b213d7ad1f431a8cdbad7', 'admin', {'{email}': admin.email, '{subject}':req.body.subject, '{description}':req.body.message, '{link}': `${cmsLink}quotes/view/${id}`});
			// await Table.findByIdAndUpdate(id, {senttocustomer:1}, {useFindAndModify:false});
			res.send({message:"Quote has been sent to admin successfully!"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid quote id"});
	  });
  };
  