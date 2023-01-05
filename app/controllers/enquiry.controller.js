const db = require("../models");
const Table = db.enquiry;
const Columns = db.columns;
const TradieTable = db.tradie;
const Setting = db.settings;
const Inbox = db.inbox;
const Note = db.notes;
const Document = db.documents;
const excel = require("exceljs");
const msg = require("../middleware/message");
const email = require("../middleware/email");
const activity = require("../middleware/activity");
const fileReader = require("../middleware/filereader");
var sprintf = require('sprintf-js').sprintf;
const settings_id = '6275f6aae272a53cd6908c8d';
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
// Create and Save a new record
exports.create = async(req, res) => {
  var ms = await msg('enquiry');
  var set = await Setting.findById(settings_id).then();
	var Autoid = sprintf('%01d', set.enquiries);
  if (!req.body.title)    
    return res.status(400).send({ message: ms.messages[2].message });
    req.body.uid="ENQ"+Autoid;
			Table.create(req.body)
			.then(async(data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[8].message});
			  } 
			  else {				  
				//await email('627a49c8968ec71b14435192', 'admin', {'{name}': data.name, '{email}': data.email, '{link}': `${cmsLink}register/${data.id}`});      
				activity(ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
        await Setting.findByIdAndUpdate(settings_id, { enquiries: set.enquiries + 1 }, { useFindAndModify: false });
         res.send({ message: ms.messages[0].message });
			  }
			})
			.catch((err) => {
			res.status(500).send({ message: ms.messages[2].message});
			});
};

exports.activity = async(req, res) => {
  var ms = await msg('login');
  const { from, to } = req.query;
  const id = req.params.id;
  const activities = await fileReader('admin', id, from, to);
  if(activities)
  res.send(activities);
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
  var ms = await msg('enquiry');
  const { page, size, search, field, dir, status, tradie } = req.query;
  var sortObject = {};
  //console.log(info);
  if(search){	
  var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" }}, { phone: { $regex: new RegExp(search), $options: "i" }}, { email: { $regex: new RegExp(search), $options: "i" }}]};
  }
  else
  condition = {};
  condition.status = status ? status : { $ne : 'Trash'};
  condition._id = { $ne : '61efce935f2e3c054819a02f'};
  if(tradie) condition.tradie={$in:tradie};
  const crby = {path: 'createdBy', select: {'firstname': 1, 'lastname': 1}};
  const mfby = {path: 'modifiedBy', select: {'firstname': 1, 'lastname': 1}}; 
  const cust = {path: 'customer', select: {'uid': 1, 'name': 1}}; 
  const agent = {path: 'agent', select: {'name': 1, 'uid': 1}};
  
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
  Table.paginate(condition, { collation: { locale: "en" }, populate: [crby, mfby, cust, agent], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

// Retrieve all trash records from the database.
exports.trashAll = async(req, res) => {
  var ms = await msg('enquiry');
  const { page, size, search, field, dir } = req.query;
  var sortObject = {};
  //console.log(info);
  if(search)
  var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" }}, { phone: { $regex: new RegExp(search), $options: "i" }}, { email: { $regex: new RegExp(search), $options: "i" }}]};
  else
  condition = {};
  condition['status'] = 'Trash';
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, { populate: [ {path: 'createdBy', select: ["firstname", "lastname"]},{path: 'modifiedBy', select: ["firstname", "lastname"]}], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

// Find a single record with an id
exports.findOne = async(req, res) => {
  const id = req.params.id;  
  const notes = await Note.find({ enquiry: id}).sort({ _id: -1 }).populate('createdBy');
  const mails = await Inbox.find({ enquiry: id}).sort({ _id: -1 });
  const documents = await Document.find({ enquiry: id, status: 'Active'}).sort({ _id: -1 }).populate('createdBy');
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('customer')
    .populate('agent')
    .populate('tenant')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: ms.messages[8].message});
      else res.send({data: data, notes: notes, mails: mails, documents: documents});
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

// Find a single record with an id
exports.findHistory = async(req, res) => {
  const id = req.params.id;
  
  TradieTable.find({status:'Active'})
    .populate('createdBy')
    .populate('modifiedBy')
    .then(async(data) => {
      if (!data)
      res.status(404).send({ message: ms.messages[8].message});
      else {
      
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};
// Update all records from the database.
exports.updateAll = async(req, res) => {
  var ms = await msg('enquiry');
  const { ids, status } = req.query;
  Table.updateMany(
   { _id: { $in: JSON.parse(ids) } },
   { $set: { status : status } })
    .then((data) => {
		activity(ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.updateAll);
      res.status(200).send({ message: ms.messages[5].message});
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

// Update a record by the id in the request
exports.update = async(req, res) => {  
  var ms = await msg('enquiry');
  //console.log(req.body);
  if (!req.body)
    return res.status(400).send({ message: ms.messages[2].message});
  const id = req.params.id;  

		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[7].message});
			  } 
			  else {				  
				// activity(ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[1].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[2].message});
			});

};

// Update a record by the id in the request
exports.profilepic = async(req, res) => {  
  var ms = await msg('enquiry');
  const id = req.params.id;  
  if(req.file)
  req.body.photo = req.file.filename;
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
	.then((data) => {
	  if (!data) {
		res.status(404).send({ message: ms.messages[8].message});
	  } 
	  else{
		activity(ms.messages[13].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.profile);
		  res.send({ photo:req.file.filename, message: ms.messages[13].message });
	  }
	})
	.catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
	});
};

// Delete a record with the specified id in the request
exports.delete = async(req, res) => {
  var ms = await msg('enquiry');
  const id = req.params.id;

  Table.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: ms.messages[8].message});
      } else {
		activity(ms.messages[9].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
        res.send({ message: ms.messages[6].message });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

// Delete all records from the database.
exports.deleteAll = async(req, res) => {
	var ms = await msg('enquiry');
  Table.deleteMany({})
    .then((data) => {
      res.send({ message: ms.messages[8].message });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

exports.trash = async(req, res) => {
	var ms = await msg('enquiry');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[8].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Trash'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[8].message});
			  } 
			  else {
				activity(ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
				  res.send({ message: ms.messages[3].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[2].message});									
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
	  });
};

exports.restore = async(req, res) => {
  var ms = await msg('enquiry');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[8].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Active'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[8].message});
			  } 
			  else {
				activity(ms.messages[4].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
				  res.send({ message: ms.messages[4].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[2].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
	  });
};
  
exports.exceldoc = async(req, res) => {
  var ms = await msg('enquiry');
  Table.find({ status : { $ne : 'Trash'} })
    .then((data) => {
		let records = [];

    data.forEach((obj) => {
      records.push({
        id: obj.id,
        firstname: obj.firstname,
        lastname: obj.lastname,
        username: obj.username,
        email: obj.email,
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Records");

    worksheet.columns = [
      { header: "Id", key: "id", width: 5 },
      { header: "First Name", key: "firstname", width: 25 },
      { header: "Last Name", key: "lastname", width: 25 },
      { header: "username", key: "username", width: 25 },
      { header: "email", key: "email", width: 10 },
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

	activity("Export all the admin users data into Excel file.", req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.export);
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });


    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[8].message});
    });
};

exports.sendEnquiry = async (req, res) => {
  var ms = await msg('enquiry');
	const id = req.params.id;	
  var set = await Setting.findById(settings_id).then();
	const enquiry = await Table.findById(id).populate({ path: 'createdBy', select: ['firstname', 'lastname'] }).populate({ path: 'modifiedBy', select: ['firstname', 'lastname'] });
	var ids=enquiry.tradie ? enquiry.tradie : [];
  var trd=[];
	var history=enquiry.history ? enquiry.history : [];
  var description=req.body.description;
  req.body.tradie.forEach((e)=>{
    ids.push(e.value);
    trd.push(e.value);
  });	
  var his={};
  his.tradies=trd;
  his.description=description;
  his.date=new Date();
history.push(his);
   Table.findByIdAndUpdate(id, {tradie:ids, status: 'Quote Requested', rfq_description:description, history:history}, {useFindAndModify:false})
  .then(async(list)=>{
    const trds = await TradieTable.find({_id:{$in:trd}, status:"Active"}).then((res)=>{return res;}).catch((e)=>{return null;});
    if(trds.length>0) {
      // trds.forEach(async(data)=>{
        for(const data of trds){
      await email('6375ccacdecff938dcb3df94', 'admin', {'{name}': data.name, '{email}': data.email, '{enqid}': enquiry.uid, '{title}': enquiry.title, '{settingemail}': set.accountemail, '{link}': `${tradieLink}enquiry/view/${id}`, '{description}' : `${description}`});
    };    
  }
    res.send({message: ms.messages[8].message});
  })
  .catch((e)=>{ 
    res.status(400).send({message: ms.messages[8].message});
  });
	
}

exports.resendEnquiry = async (req, res) => {
  var ms = await msg('enquiry');
	const {id, index, tradie} = req.query;
  const enquiry = await Table.findById(id);
    const tradieDet = await TradieTable.findById(tradie);
if(enquiry&& tradieDet && index){
     await email('6375ccacdecff938dcb3df94', 'admin', {'{name}': tradieDet.name, '{email}': tradieDet.email, '{link}': `${cmsLink}`, '{description}' : `${enquiry.history[index].description}`});
     res.send({message: ms.messages[8].message});
}
     else res.status(404).send({message: ms.messages[8].message});
}