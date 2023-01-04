const db = require("../models");
const Table = db.quotes;
const Admin = db.adminusers;
const Setting = db.settings;
const TradieTable = db.tradie;
const enquiryTable = db.enquiry;
const Document = db.documents; 
const Note = db.notes;
const Inbox = db.inbox;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
//Required package
//var pdf = require("pdf-creator-node");
const puppeteer = require("puppeteer");
var juice = require('juice');
const email = require("../middleware/email");
const gethtml = require("../middleware/pdfhtml");
var fs = require("fs"); 
var css = fs.readFileSync("./css/quote.css", "utf8");

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
				generatePdf(data._id);
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
  Table.paginate(condition, { collation: { locale: "en" }, populate: ['createdBy', 'modifiedBy', 'customer', 'agent', 'tradie', 'enquiry'], offset, limit, sort: sortObject })
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
	/*const { status } = req.query;
	Table.find({customer: id, status: "Approved"})
  .sort({name: 1})
    .then((data) => {
      res.send({list: data});
    })
    .catch((err) => {
		res.send(err);
    });*/
	
  var data = await Table.find({usertype: 'customer', customer: id, status: "Approved"});
  if(data.length > 0){ 
	res.send({list: data});
  }
  else{
	var data = await Table.find({usertype: 'agent', agent: id, status: "Approved"});
	res.send({list: data});
  }
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
    .populate('agent')
    .populate('tenant')
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
  const mails = await Inbox.find({ quote: id}).sort({ _id: -1 });  
  const documents = await Document.find({ quote: id, status: 'Active'}).sort({ _id: -1 }).populate('createdBy');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .populate('enquiry')
    .populate('tradie')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: "OK"});
      else res.send({data: data, notes: notes, mails: mails, documents: documents});
    })
    .catch((err) => {
      res.status(500).send({ message: "Invalid quote id"});
    });
};

// approve a quote
exports.approve = async(req, res) => {
	const id = req.params.id;
	const status = req.params.status;
  var set = await Setting.findById(settings_id).then();
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
				if(status === 'Approved')
					await email('63786d08b055c0628e7e32d3', 'admin', {'{name}': tradieDet.name, '{email}': tradieDet.email, '{link}': `${tradieLink}quotes/view/${id}`, '{quote}':data.uid, '{title}':data.title, '{settingemail}': set.accountemail});
				else if(status === 'Declined')
					await email('6392fc2ce7f0f032633fa2c5', 'admin', {'{name}': tradieDet.name, '{email}': tradieDet.email, '{link}': `${tradieLink}quotes/view/${id}`, '{quote}':data.uid, '{title}':data.title, '{settingemail}': set.accountemail});
				else if(status === 'Revise')
					await email('6392fc3de7f0f032633fa2c6', 'admin', {'{name}': tradieDet.name, '{email}': tradieDet.email, '{link}': `${tradieLink}quotes/view/${id}`, '{quote}':data.uid, '{title}':data.title, '{settingemail}': set.accountemail});
			}
			if(status === 'Approved')
			res.send({ message: ms.messages[12].message });
			else if(status === 'Declined')
			res.send({ message: ms.messages[13].message });
			else if(status === 'Revise')
			res.send({ message: ms.messages[11].message });
		}
	  })
	  .catch((err) => {
		  console.log(err);
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
				  generatePdf(id);
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
			.then(async (data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[3].message + err});
			  }
			  else {
				await generatePdf(id);
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
const generatePdf = async(id) => {
	var foot= await gethtml.quotefooter();
	var data= await gethtml.quotehtml(id);
	
	var header= await gethtml.pdfheader();
	//const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: chromium});
	/*const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: [ '--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote' ] });
	const page = await browser.newPage();  
	
	await page.setContent(`<style>${css}</style>${data}`, { waitUntil: ['domcontentloaded', 'networkidle2'] });
	await page.pdf({
		path: `./quotes/${id}.pdf`,
		format: "A4",
		displayHeaderFooter:true,
		headerTemplate: header,
		footerTemplate: foot,
		printBackground : true,
		preferCSSPageSize: false,
		margin : {top: "140px", bottom : "40px"} 
	} ); 
	await browser.close();
	//res.send(`${id}.pdf`); 
	return 'generated';*/ 
	const browser = await puppeteer.launch(chromium);
	  const page = await browser.newPage();
	  /*await page.goto('https://news.ycombinator.com', {
		waitUntil: 'networkidle2',
	  });*/
	  //await page.setContent('Test PDF', { waitUntil: ['domcontentloaded', 'networkidle2'] });
	  await page.setContent(`<style>${css}</style>${data}`, { waitUntil: ['domcontentloaded', 'networkidle2'] });
	  // page.pdf() is currently supported only in headless mode.
	  // @see https://bugs.chromium.org/p/chromium/issues/detail?id=753118
	  await page.pdf({
		path: `./quotes/${id}.pdf`,
		format: 'letter',
		displayHeaderFooter:true,
		headerTemplate: header,
		footerTemplate: foot,
		printBackground : true,
		preferCSSPageSize: false,
		margin : {top: "140px", bottom : "40px"} 
	  });

	  await browser.close();
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
			var filename = `/quotes/${id}.pdf`;
			await Table.findByIdAndUpdate(id, {message:req.body.message, status:'Awaiting Client Approval', tstatus: 'Awaiting Client Approval', senttocustomer: 1}, {useFindAndModify:false});
			await email('6378b084b055c0628e7e32d9', 'admin', {'{subject}': req.body.subject, '{message}': req.body.message,'{email}': req.body.email, '{link}': `${cmsLink}`, '{attachment}': req.body.attach ? filename : null},'', req.body.message);
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
			 await email('637b213d7ad1f431a8cdbad7', 'admin', {'{email}': admin.email, '{subject}':req.body.subject, '{description}':req.body.message, '{link}': `${cmsLink}quotes/view/${id}`}, '', req.body.message);
			// await Table.findByIdAndUpdate(id, {senttocustomer:1}, {useFindAndModify:false});
			res.send({message:"Quote has been sent to admin successfully!"});
		}
	  })
	  .catch((err) => {
		res.status(500).send({ message: "Invalid quote id"});
	  });
  };
  
  exports.Html = async(req, res) => {
	const {id} = req.body;
	if(!id) res.status(404).send({message:"Quote not found!"});
	else{
	var data= await gethtml.quotehtml("");
	var header= await gethtml.pdfheader();
	var html = `<html>${header + data}</html>`
	//var content = juice(`<style>${css}</style>${header}`);	
	res.send(content);
	}
  }