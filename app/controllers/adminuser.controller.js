const db = require("../models");
const Table = db.adminusers;
const Role = db.role;
const Columns = db.columns;
const Setting = db.settings;
const Privilege = db.privileges;
const excel = require("exceljs");
const sharp = require('sharp');
const msg = require("../middleware/message");
const email = require("../middleware/email");
const activity = require("../middleware/activity");
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const fileReader = require("../middleware/filereader");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
// Create and Save a new record
exports.create = async(req, res) => {
  var ms = await msg('adminusers');
	var set = await Setting.findById('6275f6aae272a53cd6908c8d').then();
  if (!req.body.firstname && !req.body.email)    
    return res.status(400).send({ message: ms.messages[4].message });
  Table.findOne({ $or: [{ email: req.body.email}], status: { $ne: 'Trash' }})
    .then(async(data) => {
		if (data && data.email === req.body.email) 
			return res.status(400).send({ message: ms.messages[2].message });
		else{			   
			const info = {};
			Columns.find({type: 'Admin'}, { name: 1, columns: 1 }).then(async(cursor) => {
				//console.log(cursor);
			  cursor.forEach(function(doc, err) {
				  info[doc.name] = doc.columns;
			  });
			const roleData = await Role.findById(req.body.role);
			req.body.columns = info;
			req.body.privileges = roleData.privileges;
			Table.create(req.body)
			.then(async(data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[10].message});
			  } 
			  else {				  
				await email('627a49c8968ec71b14435192', 'admin', {'{name}': data.name, '{email}': data.email, '{link}': `${cmsLink}register/${data.id}`, '{settingemail}': set.accountemail});      
				activity(ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
				  res.send({ message: ms.messages[0].message });
			  }
			})
			.catch((err) => {
			res.status(500).send({ message: ms.messages[4].message});
			});
			});
		  
		}
      })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});	  
	});
};

exports.handleLogin = async(req, res, next) => {
  var ms = await msg('login');
  var set = await Setting.findById('6275f6aae272a53cd6908c8d').then();
  var pri = await Privilege.find({status: 'Active', type : 'Admin'})
  const id = req.params.id;  
  Table.findById(id)
	.populate('role')
    .then((data) => {
		if (!data)
			return res.status(400).send({ message: ms.messages[0].message });
		else{
			// activity('Login successfully', data._id, 'admin');			
			var token = jwt.sign({ id: data._id }, config.secret, {
				expiresIn: 86400, // 24 hours
			});
           
			const info = {
					message: "Success",
					id: data._id,
					format: set.dateformat,
					zone: set.timezone,
					username: data.username,
					name: data.firstname,
					photo: data.photo,
					showcolumns: data.columns, 
					email: data.email,
					accessToken: token,
				};			
				pri.forEach(function(doc, err) {
					info[doc.name] = [];
				});
				data.role.privileges.forEach( element => {
					if(element !== null){
						for( const [key, value] of Object.entries(element)){
							info[key] = value;
						}						
					}
				});
				return res.status(200).send(info);
      }
      })
	  .catch((err) => {
		res.status(500).send({ message: "Error retrieving record" });		  
	});
};

exports.setPass = async(req, res, next) => {
  var ms = await msg('login');
	var set = await Setting.findById('6275f6aae272a53cd6908c8d').then();
	console.log(set);
  const id = req.params.id;
  Table.findById(id)
    .then(async(data) => {
		if (!data)
			return res.status(400).send({ message: ms.messages[0].message });
		else{
      await email('627a49c8968ec71b14435192', 'admin', {'{name}': data.firstname +' '+ data.lastname, '{email}': data.email, '{link}': `${cmsLink}register/${data.id}`, '{settingemail}': set.quoteemail});  
				return res.status(200).send({message: 'Activation link send to particular mail address'});
      }
      })
	  .catch((err) => {
		res.status(500).send({ message: "Error retrieving record" });		  
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
  var ms = await msg('adminusers');
  const { page, size, search, field, dir, status, role } = req.query;
  var sortObject = {};
  //console.log(info);
  if(search){	  
  var rolesn = await Role.find({ status : { $ne : 'Trash'}, name: { $regex: new RegExp(search), $options: "i" }});
  const info = [];
	rolesn.forEach(function(doc, err) {
	  info.push(doc._id);
	});
  var users = await Table.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
  const info1 = [];
	users.forEach(function(doc, err) {
	  info1.push(doc._id);
	});
  var condition = { $or: [{ firstname: { $regex: new RegExp(search), $options: "i" }}, { lastname: { $regex: new RegExp(search), $options: "i" }}, { username: { $regex: new RegExp(search), $options: "i" }}, { mobile: { $regex: new RegExp(search), $options: "i" }}, { email: { $regex: new RegExp(search), $options: "i" }}, { role: { $in: info }},  { createdBy: { $in: info1 }},  { modifiedBy: { $in: info1 }}]};
  }
  else
  condition = {};
  condition.role = role ? role : { $ne : null};
  condition.status = status ? status : { $ne : 'Trash'};
  condition._id = { $ne : '61efce935f2e3c054819a02f'};
  const roles = {path: 'role', select: 'name'};  
  const crby = ({path: 'createdBy', select: {'firstname': 1, 'lastname': 1}});
  const mfby = {path: 'modifiedBy', select: {'firstname': 1, 'lastname': 1}}; 
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);
//condition = {};
  //condition._id = { $ne : '61efce935f2e3c054819a02f'};
  //condition.role.name = { $ne : null};
  Table.paginate(condition, { collation: { locale: "en" }, populate: [crby, mfby, roles], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

// Retrieve all trash records from the database.
exports.trashAll = async(req, res) => {
  var ms = await msg('adminusers');
  const { page, size, search, field, dir } = req.query;
  var sortObject = {};
  var rolesn = await Role.find({ status : { $ne : 'Trash'}, name: { $regex: new RegExp(search), $options: "i" }});
  const info = [];
	rolesn.forEach(function(doc, err) {
	  info.push(doc._id);
	});
  var users = await Table.find({ status : { $ne : 'Trash'}, firstname: { $regex: new RegExp(search), $options: "i" }});
  const info1 = [];
	users.forEach(function(doc, err) {
	  info1.push(doc._id);
	});
  //console.log(info);
  if(search)
  var condition = { $or: [{ firstname: { $regex: new RegExp(search), $options: "i" }}, { lastname: { $regex: new RegExp(search), $options: "i" }}, { username: { $regex: new RegExp(search), $options: "i" }}, { mobile: { $regex: new RegExp(search), $options: "i" }}, { email: { $regex: new RegExp(search), $options: "i" }}, { role: { $in: info }},  { createdBy: { $in: info1 }},  { modifiedBy: { $in: info1 }}]};
  else
  condition = {};
  condition['status'] = 'Trash';
  sortObject[field] = dir;
  const { limit, offset } = getPagination(page, size);

  Table.paginate(condition, { populate: ['role', {path: 'createdBy', select: ["firstname", "lastname"]},{path: 'modifiedBy', select: ["firstname", "lastname"]}], offset, limit, sort: sortObject })
    .then((data) => {
      res.send({
        totalItems: data.totalDocs,
        records: data.docs,
        totalPages: data.totalPages,
        currentPage: data.page - 1,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

// Find a single record with an id
exports.findOne = async(req, res) => {
  const id = req.params.id;
  
  Table.findById(id)
    .populate('createdBy')
    .populate('modifiedBy')
    .populate('role')
    .then((data) => {
      if (!data)
      res.status(404).send({ message: ms.messages[10].message});
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

// Update all records from the database.
exports.updateAll = async(req, res) => {
  var ms = await msg('adminusers');
  const { ids, status } = req.query;
  Table.updateMany(
   { _id: { $in: JSON.parse(ids) } },
   { $set: { status : status } })
    .then((data) => {
		activity(ms.messages[8].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.updateAll);
      res.status(200).send({ message: ms.messages[8].message});
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

// Update a record by the id in the request
exports.update = async(req, res) => {  
  var ms = await msg('adminusers');
  if (!req.body)
    return res.status(400).send({ message: ms.messages[4].message});
  const id = req.params.id;  
  //console.log(req.file);
  //var em = await email('627a49c8968ec71b14435192', {name: req.body.firstname, email: req.body.email});
  Table.findOne({ $or: [{ email: req.body.email}], _id: { $ne : id}, status: { $ne : "Trash" }})
    .then((data) => {
		//console.log(data);
		if (data && data.email === req.body.email) 
			return res.status(400).send({ message: ms.messages[2].message });
		
		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[10].message});
			  } 
			  else {				  
				activity(ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[1].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[4].message});
			});
		}
      })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});	  
	});
};

// Update a record by the id in the request
exports.profilepic = async(req, res) => {  
  var ms = await msg('adminusers');
  const id = req.params.id;  
  if(req.file)
  req.body.photo = req.file.filename;
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
	.then((data) => {
	  if (!data) {
		res.status(404).send({ message: ms.messages[10].message});
	  } 
	  else{
		activity(ms.messages[13].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.profile);
		  res.send({ photo:req.file.filename, message: ms.messages[13].message });
	  }
	})
	.catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
	});
};

// Update a record by the id in the request
exports.profile = async(req, res) => {  
	var ms = await msg('adminusers');
//console.log(req.body);
  if (!req.body)
    return res.status(400).send({ message: ms.messages[4].message});
  const id = req.params.id; 
  Table.findOne({ $or: [{ email: req.body.email}], _id: { $ne : id}})
    .then((data) => {
		if (data && data.email === req.body.email) 
			return res.status(400).send({ message: ms.messages[2].message });
		else{
		  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[10].message});
			  } 
			  else{
				activity(ms.messages[12].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
				  res.send({ message: ms.messages[12].message });
			  }
			})
			.catch((err) => {
			  res.status(500).send({ message: ms.messages[4].message });
			});
		}
      })
	  .catch((err) => {
		res.status(500).send({ message: ms.messages[10].message });		  
	});
};

// Create Password a record by the id in the request
exports.createpassword = (req, res) => {
  if (!req.body)
    return res.status(400).send({ message: "Data to update can not be empty!" });
  const id = req.params.id;
  Table.findById(id)
    .then((data) => {
      const saltRounds = 10;
      const myPlaintextPassword = req.body.password;

      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
          Table.findByIdAndUpdate(id, { password: hash, status: 'Active' }, { useFindAndModify: false })
            .then(async(data) => {

              if (!data) {
                res.status(404).send({ message: err });
              }
              else {
               // await email('629489cbfabff6261014f1fc', 'admin', {'{name}': data.name, '{email}': data.email, '{link}': `${cmsLink}`});  
                activity('update#' + data.name + ' User password has been created successfully', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.password);
                res.send({ message: "User password has been created successfully" });
              }
            })
            .catch((err) => {
              res.status(500).send({ message: err + id });
            });
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving record with id=" + id });
    });
};

// Change Password a record by the id in the request
exports.changepassword = async(req, res) => {   
	var ms = await msg('adminusers');
  if (!req.body)
  return res.status(400).send({ message: "Data to update can not be empty!" });
const id = req.params.id;
Table.findById(id)
  .then((data) => {
    // if (data && data.password === req.body.cpassword) {
     
    bcrypt.compare(req.body.oldpassword, data.password, function (err, result) {
      console.log({ result: result });
      if (result) {
        bcrypt.compare(req.body.password, data.password, function (err, samepassword) {
          if (samepassword) {
            return res.status(400).send({ message: "Already there is a same password" });
          }else{
        const saltRounds = 10;
        const myPlaintextPassword = req.body.password;

        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
            Table.findByIdAndUpdate(id, { password: hash }, { useFindAndModify: false })
              .then((data) => {
                if (!data) {
                  res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!' });
                } else{
                  activity(ms.messages[11].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.password);
                 res.send({ message:  ms.messages[11].message });
                }
              })
              .catch((err) => {
                res.status(500).send({ message: "Error updating record with id=" + id });
              });
          });
        });
      }
    });
      } else {
        return res.status(400).send({ message: "Incorrect Current password" });
      }
    })
        
  })
  .catch((err) => {
    res.status(500).send({ message: "Error retrieving record with id=" + id });
  });
  };


exports.updateColumns = async(req, res) => {  
  var ms = await msg('adminusers');
const id = req.params.id;
  Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
  .then((data) => {
    if (!data) {
    res.status(404).send({ message: ms.messages[10].message});
    } else res.send({ message: "Column settings has been successfully updated." });
  })
  .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
  });

};

// Delete a record with the specified id in the request
exports.delete = async(req, res) => {
  var ms = await msg('adminusers');
  const id = req.params.id;

  Table.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: ms.messages[10].message});
      } else {
		activity(ms.messages[9].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
        res.send({ message: ms.messages[9].message });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

// Delete all records from the database.
exports.deleteAll = async(req, res) => {
	var ms = await msg('adminusers');
  Table.deleteMany({})
    .then((data) => {
      res.send({ message: ms.messages[8].message });
    })
    .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
    });
};

exports.trash = async(req, res) => {
	var ms = await msg('adminusers');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[10].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Trash'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[10].message});
			  } 
			  else {
				activity(ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.delete);
				  res.send({ message: ms.messages[5].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[4].message});									
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
	  });
};

exports.restore = async(req, res) => {
  var ms = await msg('adminusers');
	const id = req.params.id;
	
	Table.findById(id)
	  .then((data) => {
		if (!data)
		  res.status(404).send({ message: ms.messages[10].message });
		else {
			Table.findByIdAndUpdate(id, {status : 'Active'}, { useFindAndModify: false })
			.then((data) => {
			  if (!data) {
				res.status(404).send({ message: ms.messages[10].message});
			  } 
			  else {
				activity(ms.messages[7].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore);
				  res.send({ message: ms.messages[7].message });
			  }
			})
			.catch((err) => {
				res.status(500).send({ message: ms.messages[4].message});
			});
		}
	  })
	  .catch((err) => {
      res.status(500).send({ message: ms.messages[10].message});
	  });
};
  
exports.exceldoc = async(req, res) => {
  var ms = await msg('adminusers');
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
      res.status(500).send({ message: ms.messages[10].message});
    });
};



// if (!req.body)
//       return res.status(400).send({ message: ms.messages[4].message});
//     const id = req.params.id; 
//     Table.findById(id)
//       .then((data) => {
//       if (data && data.password === req.body.oldpassword && data.password !==req.body.password) {
//         Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
//         .then((data) => {
//           if (!data) {
// 				res.status(404).send({ message: ms.messages[10].message});
// 		  } 
// 		  else{
// 			activity(ms.messages[11].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin');
// 			  res.send({ message: ms.messages[11].message });
// 		  }
//         })
//         .catch((err) => {
//           res.status(404).send({ message: ms.messages[4].message });
//         });
//       }else if(data.password ===req.body.password){
//         return res.status(400).send({ message: "Already there is a same password" });

//       } else {
//         return res.status(400).send({ message: ms.messages[14].message });
//       }
//         })
//       .catch((err) => {
//       res.status(500).send({ message: ms.messages[10].message });		  
//     });