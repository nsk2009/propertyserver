const db = require("../models");
const Table = db.emailnotification;
const Templates = db.emailtemplates;
const Admin = db.adminusers;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
const fs = require('fs');

const getPagination = (page, size) => {
	const limit = size ? +size : 3;
	const offset = page ? page * limit : 0;

	return { limit, offset };
};
const mailchimp = require("@mailchimp/mailchimp_marketing");
mailchimp.setConfig({
	apiKey: "e58be287284e47b88af640600b30c9d9-us18",
	server: "us18",
})

// Create and Save a new record
exports.create = async (req, res) => {
	var ms = await msg('emailnotification');
	if (!req.body)
	return res.status(400).send({ message: ms.messages[3].message });
	else if (req.body.type ==='Notification' && !req.body.subject)
	return res.status(400).send({ message: 'Missing subject parameter' });
	else if (!req.body.content)
	return res.status(400).send({ message: 'Missing content parameter' });
	
	
	const existdata = await Table.findOne({ name: req.body.name, type: req.body.type, status: { $ne: 'Trash' } })

	if (existdata && existdata.test_publickey === req.body.test_publickey)
		return res.status(400).send({ message: ms.messages[4].message });
	else {
		// if (req.body.type === "Template") {
		// 	console.log(temp);
		// 	if(temp.message==="Success")
		// 	req.body.template_id = temp.id;
		// 	else{
		// 		return res.status(402).send({ message: temp.message });
		// 	}
		// }
		const newdata = await Table.create(req.body)

		if (!newdata) {
			res.status(404).send({ message: ms.messages[3].message });
		}
		else {
			activity(req.body.name + ' module. ' + ms.messages[0].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.create);
			res.send({ message: ms.messages[0].message });
		}
		// })
		// .catch((err) => {
		//   res.status(500).send({ message: ms.messages[2].message });
		// });
	}

};

exports.restore = async (req, res) => {
	var ms = await msg('smstemplate');
	const id = req.params.id;

	Table.findById(id)
		.then((data) => {
			Table.findOne({ name: data.name, type: data.type, status: { $ne: 'Trash' } })
				.then((e) => {
					if (e && e.name === data.name) {
						console.log(e);
						res.status(404).send({ message: ms.messages[4].message });
					} else {
						console.log(e);
						Table.findByIdAndUpdate(id, { status: 'Active' }, { useFindAndModify: false })
							.then((data) => {
								if (!data) {
									res.status(404).send({ message: ms.messages[6].message });
								} else {
									activity(data.name + ' module. ' + ms.messages[5].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.restore)
									res.send({ message: ms.messages[5].message });
								}
							})
							.catch((err) => {
								res.status(500).send({ message: ms.messages[6].message });
							});

					}
				})
		})
		.catch((err) => {
			res.status(500).send({ message: ms.messages[6].message + id });
		});
};


// Retrieve all records from the database.
exports.findAll = async(req, res) => {
	const { page, size, search, field, dir, status, type, notification_type } = req.query;
	var sortObject = {};
  if (search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
    var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { subject: { $regex: new RegExp(search), $options: "i" } }, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } }] };
  }
  else
    var condition = {};
	condition['status'] = status ? status : { $ne: 'Trash' };
	condition['type'] = type;
	if(notification_type)
	condition['notification_type'] = notification_type;
	sortObject[field] = dir;
	const { limit, offset } = getPagination(page, size);

	Table.paginate(condition, { populate: ["createdBy", "modifiedBy"], offset, limit, sort: sortObject })
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

// Retrieve all trash records from the database.
exports.trashAll = async(req, res) => {
	const { page, size, search, field, dir, type } = req.query;
	var sortObject = {};
	if (search){
  var users = await Admin.find({ status : { $ne : 'Trash'}, $or: [{firstname: { $regex: new RegExp(search), $options: "i" }
  }, {lastname: { $regex: new RegExp(search), $options: "i" }}]});
	  const info1 = [];
	  users.forEach(function (doc, err) {
		info1.push(doc._id);
	  });
    var condition = { $or: [{ name: { $regex: new RegExp(search), $options: "i" } }, { subject: { $regex: new RegExp(search), $options: "i" } }, { modifiedBy: { $in: info1 } }, { createdBy: { $in: info1 } }] };
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
			res.status(500).send({
				message: err.message || "Some error occurred while retrieving records.",
			});
		});
};

// Find a single record with an id
exports.findOne = async (req, res) => {
	var ms = await msg('emailnotification');
	const id = req.params.id;
	Table.findById(id)
		.populate('createdBy')
		.populate('modifiedBy')
		.then((data) => {
			if (!data)
				res.status(404).send({ message: ms.messages[2].message });
			else res.send(data);
		})
		.catch((err) => {
			res.status(500).send({ message: ms.emailnotification[2].message });
		});
};

// Update a record by the id in the request
exports.update = async (req, res) => {
	var ms = await msg('emailnotification');
	/*
				const response = await mailchimp.lists.addListMember('d1025e1265', {
					email_address: 'sheikdawood@aparajayah.com',
					status: 'subscribed',
					email_type: 'html',
					merge_fields: {
						FNAME: 'Prabhakaran',
						LNAME: 'Selvam'
					},
					tags: ['PHP']
				})
				console.log(response);
				//res.send(response)	*/
	if (!req.body)
	return res.status(400).send({ message: ms.messages[3].message });
	else if (!req.body.subject)
	return res.status(400).send({ message: 'Missing subject parameter' });
	else if (!req.body.content)
	return res.status(400).send({ message: 'Missing content parameter' });
	const id = req.params.id;
	const existdata = await Table.findOne({ name: req.body.name, type: req.body.type, status: { $ne: 'Trash' }, _id: { $ne: id } })
	//console.log(data);
	if (existdata && existdata.name === req.body.name)
		return res.status(400).send({ message: ms.messages[4].message });
	else {
		
		// if (req.body.type === "Template") {
			
			
		// 	//console.log(temp);
		// 	if(temp==='Success'){
		// 		const updateData = await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })

		// 		if (!updateData) {
		// 		res.status(404).send({ message: ms.messages[2].message });
		// 		}
		// 		else {
		// 		//   const tempId = await Table.findByIdAndUpdate(id, {template_id : temp}, { useFindAndModify: false });
		// 		activity(req.body.name + ' module. ' + ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
		// 		res.send({ message: ms.messages[1].message, templateStatus: temp });
		// 		}
		// 		}else{
		// 		res.status(402).send({message:temp});
		// 	}
		// }
		// else{
			const updateData = await Table.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
			// activity(req.body.name + ' module. ' + ms.messages[1].message, req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.edit);
			res.send({ message: ms.messages[1].message });		
		// }
		// })
		// .catch((err) => {
		//   res.status(500).send({ message: ms.messages[2].message });
		// });
	}

};
exports.trash = async (req, res) => {
	var ms = await msg('emailnotification');
	const id = req.params.id;

	Table.findById(id)
		.then((data) => {
			if (!data)
				res.status(404).send({ message: ms.messages[6].message });
			else {
				Table.findByIdAndUpdate(id, { status: 'Trash' }, { useFindAndModify: false })
					.then((data) => {
						if (!data) {
							res.status(404).send({ message: ms.messages[6].message + id });
						} else res.send({ message: ms.messages[5].message });
					})
					.catch((err) => {
						res.status(500).send({ message: ms.messages[6].message + id });
					});
			}
		})
		.catch((err) => {
			res.status(500).send({ message: ms.messages[6].message + id });
		});
};



// Preview Template with Id
exports.PreviewCampaign = async (req, res) => {
	if(!req.params.id){
		return res.status(400).send({message:'Missing template parameter'});
	}else{
	const { id } = req.params;
	
	const temp= await Templates.findOne({template_id:id})
	.then((res)=>{
		return res;
	})
	.catch((e)=>{
		return null;
	})
	
	res.send(temp);
}
};

// Delete a record with the specified id in the request
exports.delete = async (req, res) => {
	var ms = await msg('emailnotification');
	const id = req.params.id;

	Table.findByIdAndRemove(id, { useFindAndModify: false })
		.then((data) => {
			if (!data) {
				res.status(404).send({
					message: `Cannot delete record with id=${id}. Maybe record was not found!`,
				});
			} else {
				res.send({ message: ms.messages[5].message });
			}
		})
		.catch((err) => {
			res.status(500).send({ message: "Could not delete record with id=" + id, });
		});
};


// Find a list record with an id
exports.findList = (req, res) => {
	const { status, type } = req.query;
	Templates.find({ status: status, template_status:'Publish' })
		.then((data) => {
			res.send({ list: data });
		})
		.catch((err) => {
			res.status(500).send({ message: "Error retrieving record" });
		});
};