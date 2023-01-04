const config = require("../config/auth.config");
const db = require("../models");
const Table = db.adminusers;
const Setting = db.settings;
const Privilege = db.privileges;
const activity = require("../middleware/activity");
const msg = require("../middleware/message");
const email = require("../middleware/email");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var bcrypt = require("bcryptjs");

// login
exports.apilogin = async (req, res, next) => {
	var ms = await msg('login');
	if (!req.body)
		return res.status(400).send({ message: ms.messages[0].message });
	else if (!req.body.password && !req.body.email)
		return res.status(400).send({ message: ms.messages[0].message });
	else if (req.body.email !== 'develop@bzcloud.uk')
		return res.status(400).send({ message: ms.messages[0].message });
	else if (req.body.password !== 'Cash@2022!')
		return res.status(400).send({ message: ms.messages[0].message });
	else {
		var token = jwt.sign({ id: '62d7a5cad7bf693f801c12d4' }, config.secret, {
			expiresIn: 86400, // 24 hours
		});
		return res.status(200).send({accessToken: token});
	}
};

// login
exports.login = async (req, res, next) => {
	var ms = await msg('login');
	var set = await Setting.findById('6275f6aae272a53cd6908c8d').then();
	var pri = await Privilege.find({ status: 'Active', type: 'Admin' });
	if (!req.body.password && !req.body.email)
		return res.status(400).send({ message: ms.messages[0].message });
	Table.findOne({ email: req.body.email, status: "Active" })
		.populate('role')
		.then((data) => {
			if (!data)
				return res.status(400).send({ message: ms.messages[0].message });
			bcrypt.compare(req.body.password, data.password, function (err, result) {

				if (!result)
					return res.status(400).send({ message: ms.messages[0].message });
				else {
					//activity('Login successfully', req.headers["user"]);	
					activity('Login successfully', data._id, 'admin', req.session.useragent, req.session.useragent.login);
					var token = jwt.sign({ id: data._id }, config.secret, {
						expiresIn: 86400, // 24 hours
					});
					const info = {
						message: "Success",
						id: data._id,
						format: set.dateformat,
						zone: set.timezone,
						username: data.username,
						firstname: data.firstname,
						lastname: data.lastname,
						photo: data.photo,
						showcolumns: data.columns,
						email: data.email,
						accessToken: token,
						rolename: data.role.name,
					};
					pri.forEach(function (doc, err) {
						info[doc.name] = [];
					});
					data.role.privileges.forEach(element => {
						if (element !== null) {
							for (const [key, value] of Object.entries(element)) {
								info[key] = value;
							}
						}
					});
					return res.status(200).send(info);

				}
			});

		})
		.catch((err) => {
			res.status(500).send({ message: "Error retrieving record" });
		});
};

// forgot
exports.forgot = async (req, res) => {
	var ms = await msg('login');
	var set = await Setting.findById('6275f6aae272a53cd6908c8d').then();
	if (!req.body.email)
		return res.status(400).send({ message: ms.messages[1].message });
	Table.findOne({ email: req.body.email, status: { $ne: 'Trash' } })
		.then(async (data) => {
			if (!data)
				return res.status(400).send({ message: ms.messages[1].message });
			else {
				await email('627a4d0d0b4e6f3ae8039854', 'admin', { '{name}': data.firstname, '{email}': req.body.email, '{link}': cmsLink + "forgot/" + data._id , '{settingemail}': set.quoteemail});
				activity(ms.messages[2].message, data._id, 'admin', req.session.useragent, req.session.useragent.password);
				return res.status(200).send({ message: ms.messages[2].message });
			}
		}) 
		.catch((err) => {
			res.status(500).send({ message: "Error retrieving record" });
		});
};

// forgot password
exports.forgotpassword = async (req, res) => {

	const { id } = req.params;

	const { password } = req.body;

	var ms = await msg('login');
	if (!req.body)
		return res.status(400).send({ message: ms.messages[3].message });

	const user = await Table.findById(id);

	const saltRounds = 10;
	const myPlaintextPassword = password;

	bcrypt.genSalt(saltRounds, function (err, salt) {
		bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
			Table.findByIdAndUpdate(id, { password: hash }, { useFindAndModify: false })
				.then((data) => {
					if (!data)
						res.status(404).send({ message: 'Cannot update record with id=${id}. Maybe record was not found!' });
					else
						res.send({ message: ms.messages[4].message });
				})
				.catch((err) => {
					res.status(500).send({ message: "Error updating record with id=" + id });
				});
		});
	});
};

// user column settings
exports.columns = async (req, res) => {
	const { id } = req.params;
	const user = await Table.findById(id);
	return res.status(200).send({ columns: user.columns });
};