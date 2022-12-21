const db = require("../models");
var sessionstorage = require('sessionstorage');
const Admin = db.adminusers;
const Settings = db.settings;
const Mail = db.mailbox;
const EmailApi = db.emailapi;
const Table = db.inbox;
const Job = db.jobs;
const Quote = db.quotes;
const Invoice = db.invoices;
const Enquiry = db.enquiry;
const Customer = db.customer;
const Agent = db.agent;
const Imap = require('imap');
var fs = require('fs');
var {Base64Decode} = require('base64-stream');
const msg = require("../middleware/message");

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
const simpleParser = require('mailparser').simpleParser;
const set_id = '6275f6aae272a53cd6908c8d';
const emailapi_id = '628f4d007abca8d1c3471a17';


// Retrieve all records from the database.
exports.syncMails = async (req, res) => {
   // console.log('bug found')
	var emailapis= await Mail.findOne({default: 1});
	var set = await Settings.findById(set_id);
	const imap = new Imap({
		user: emailapis.email,
		password: emailapis.password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true,
		tlsOptions: {
			rejectUnauthorized: false
		},
		authTimeout: 3000
	});
  
	// var dt= [];

	function openInbox(cb) {
		imap.openBox('INBOX', true, cb);
	}
	function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

	function findAttachmentParts(struct, attachments) {
		attachments = attachments ||  [];
		for (var i = 0, len = struct.length, r; i < len; ++i) {
			if (Array.isArray(struct[i])) {
				findAttachmentParts(struct[i], attachments);
			} else {
				if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
					attachments.push(struct[i]);
				}
			}
		}
		return attachments;
	}
	
	function buildAttMessageFunction(attachment) {
		var filename = attachment.params.name;
		var encoding = attachment.encoding;

		return function (msg, seqno) {
			var prefix = '(#' + seqno + ') ';
			msg.on('body', function(stream, info) {
				//Create a write stream so that we can stream the attachment to file;
				//console.log(prefix + 'Streaming this attachment to file', filename, info);
				var writeStream = fs.createWriteStream('./inbox/'+filename);
				writeStream.on('finish', function() {
					//console.log(prefix + 'Done writing to file %s', filename);
				});

				//stream.pipe(writeStream); this would write base64 data to the file.
				//so we decode during streaming using 

				if (toUpper(encoding) === 'BASE64') {
					//the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
					stream.pipe(new Base64Decode()).pipe(writeStream);
				} else  {
					//here we have none or some other decoding streamed directly to the file which renders it useless probably
					stream.pipe(writeStream);
				}
			});
			msg.once('end', function() {
				//console.log(prefix + 'Finished attachment %s', filename);
			});
		};
	}
	//['SUBJECT', 'Give Subject Here']]
	imap.once('ready', function() { 
		var fs = require('fs'), fileStream;
		openInbox(async(err, box) =>{
			if (err) throw err;
			// imap.search([ 'UNSEEN', ['SINCE', 'Sep 20, 2022'] ], function(err, results) {
			//   if (err) throw err; 
			// var f = imap.fetch(results, { bodies: '' });
			//var f = imap.seq.fetch(data.uid +':'+data.uid, { bodies: '', struct: true });
			var f = imap.seq.fetch(emailapis.mail + ':*', { bodies: '', struct: true });
			f.on('message', async(msg, seqno)=> {
				//console.log('Message #%d', seqno);
				var prefix = '(#' + seqno + ') ';
				msg.on('body', async(stream, info)=> {
					simpleParser(stream, async(err, mail) => {
						//console.log(mail.subject, 'subject'); 
						//console.log('item set:', sessionstorage.getItem('attachments'));
						var data = {};
						data.subject= mail.subject;
						data.email= emailapis.email;
						data.from= mail.from ? mail.from.text : '';
						data.date= mail.date;
						data.html= mail.html;
						data.text= mail.text;
						data.uid= seqno;
						if(sessionstorage.getItem('attachments')){							
							data.attachment = sessionstorage.getItem('attachments');
							sessionstorage.clear('attachments')
						}
						await Table.create(data);
						await Mail.findByIdAndUpdate(emailapis.id, {mail : parseInt(seqno)+1}, {useFindAndModify:false});  
					});
				});
				msg.once('attributes', async function(attrs) {
					/*var attachments = findAttachmentParts(attrs.struct);
					sessionstorage.setItem('attachments', attachments);
					for (const attachment of attachments) {
					  var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
						bodies: [attachment.partID],
						struct: true 
					  });
					  //build function to process attachment message
					  f.on('message', buildAttMessageFunction(attachment));
					}*/
				});
				msg.once('end', function() {
					//console.log(prefix + 'Finished');
				});
			});
			f.once('error', function(err) {
				//console.log('Fetch error: ' + err);
			});
			f.once('end', function() {
				//console.log('Done fetching all messages!');
				imap.end();
			});
		});
		// });
	});
  
	imap.once('error', function(err) {
		//console.log(err);
	});

	imap.once('end', function() {
		//console.log('Connection ended');
		res.send('download new succeed!')
	});

	imap.connect();
};

// Retrieve all records from the database.
exports.syncMailsOld = async (req, res) => {
   // console.log('bug found')
	var emailapis= await EmailApi.findById(emailapi_id);
	var set = await Settings.findById(set_id);
	var email =  emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username;
	const imap = new Imap({
		user: emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username,
		password: emailapis.gmail_type==='Live' ? emailapis.live_gmail_password : emailapis.sand_gmail_password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true,
		tlsOptions: {
			rejectUnauthorized: false
		},
		authTimeout: 3000
	});
  
	// var dt= [];

	function openInbox(cb) {
		imap.openBox('INBOX', true, cb);
	}
	function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

	function findAttachmentParts(struct, attachments) {
		attachments = attachments ||  [];
		for (var i = 0, len = struct.length, r; i < len; ++i) {
			if (Array.isArray(struct[i])) {
				findAttachmentParts(struct[i], attachments);
			} else {
				if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
					attachments.push(struct[i]);
				}
			}
		}
		return attachments;
	}
	//['SUBJECT', 'Give Subject Here']]
	imap.once('ready', function() {
		var fs = require('fs'), fileStream;
		openInbox(async(err, box) =>{
			if (err) throw err;
			// imap.search([ 'UNSEEN', ['SINCE', 'Sep 20, 2022'] ], function(err, results) {
			//   if (err) throw err; 
			// var f = imap.fetch(results, { bodies: '' });
			var f = imap.seq.fetch(set.inbox_count + ':*', { bodies: '', struct: true });
			f.on('message', async(msg, seqno)=> {
				//console.log('Message #%d', seqno);
				var prefix = '(#' + seqno + ') ';
				msg.on('body', async(stream, info)=> {
					simpleParser(stream, async(err, mail) => {
						//console.log(mail.subject, 'subject');        
						var data = {};
						data.subject= mail.subject;
						data.email= email;
						data.from= mail.from ? mail.from.text : '';
						data.date= mail.date;
						data.html= mail.html;
						data.text= mail.text;
						data.uid= seqno;
						var exist = await Table.findOne({uid:seqno});
						if(!exist)
							await Table.create(data);
						else	
							await Table.updateOne({uid:seqno}, data, {useFindAndModify:false});	  
					});
					await Settings.findByIdAndUpdate(set_id, {inbox_count : parseInt(seqno)+1}, {useFindAndModify:false});
				});
				msg.once('attributes', async function(attrs) {
					var attachments = findAttachmentParts(attrs.struct);
					var data = {};
					data.attachment = attachments;
					data.uid= seqno;
					var exist = await Table.findOne({uid:seqno});
					if(!exist)
						await Table.create(data);
				});
				msg.once('end', function() {
					//console.log(prefix + 'Finished');
				});
			});
			f.once('error', function(err) {
				//console.log('Fetch error: ' + err);
			});
			f.once('end', function() {
				//console.log('Done fetching all messages!');
				imap.end();
			});
		});
		// });
	});
  
	imap.once('error', function(err) {
		//console.log(err);
	});

	imap.once('end', function() {
		//console.log('Connection ended');
		res.send('Mails sync succeed!')
	});

	imap.connect();
};

// Retrieve all records from the database.
exports.download = async (req, res) => {
    const id = req.params.id;
    const pos = req.params.pos;
	var data = await Table.findById(id);
	if(data.attachment && data.attachment[pos] && !data.attachment[pos].download){	
		data.attachment[pos]['download'] = 'yes';
		await Table.findByIdAndUpdate(id, data, {useFindAndModify:false})
		var emailapis= await EmailApi.findById(emailapi_id);
		var set = await Settings.findById(set_id);
		var email =  emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username;
		const imap = new Imap({
			user: emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username,
			password: emailapis.gmail_type==='Live' ? emailapis.live_gmail_password : emailapis.sand_gmail_password,
			host: 'imap.gmail.com',
			port: 993,
			tls: true,
			tlsOptions: {
				rejectUnauthorized: false
			},
			authTimeout: 3000
		});
	  
		// var dt= [];

		function openInbox(cb) {
			imap.openBox('INBOX', true, cb);
		}
		function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

		function findAttachmentParts(struct, attachments) {
			attachments = attachments ||  [];
			for (var i = 0, len = struct.length, r; i < len; ++i) {
				if (Array.isArray(struct[i])) {
					findAttachmentParts(struct[i], attachments);
				} else {
					if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
						attachments.push(struct[i]);
					}
				}
			}
			return attachments;
		}
		
		function buildAttMessageFunction(attachment) {
			var filename = attachment.params.name;
			var encoding = attachment.encoding;

			return function (msg, seqno) {
				var prefix = '(#' + seqno + ') ';
				msg.on('body', function(stream, info) {
					//Create a write stream so that we can stream the attachment to file;
					console.log(prefix + 'Streaming this attachment to file', filename, info);
					var writeStream = fs.createWriteStream('./inbox/'+filename);
					writeStream.on('finish', function() {
						//console.log(prefix + 'Done writing to file %s', filename);
					});

					//stream.pipe(writeStream); this would write base64 data to the file.
					//so we decode during streaming using 

					if (toUpper(encoding) === 'BASE64') {
						//the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
						stream.pipe(new Base64Decode()).pipe(writeStream);
					} else  {
						//here we have none or some other decoding streamed directly to the file which renders it useless probably
						stream.pipe(writeStream);
					}
				});
				msg.once('end', function() {
					console.log(prefix + 'Finished attachment %s', filename);
				});
			};
		}
		//['SUBJECT', 'Give Subject Here']]
		imap.once('ready', function() {
			var fs = require('fs'), fileStream;
			openInbox(async(err, box) =>{
				if (err) throw err;
				// imap.search([ 'UNSEEN', ['SINCE', 'Sep 20, 2022'] ], function(err, results) {
				//   if (err) throw err; 
				// var f = imap.fetch(results, { bodies: '' });
				var f = imap.seq.fetch(data.uid +':'+data.uid, { bodies: '', struct: true });
				f.on('message', async(msg, seqno)=> {
					//console.log('Message #%d', seqno);
					var prefix = '(#' + seqno + ') ';
					msg.on('body', async(stream, info)=> {
					});
					msg.once('attributes', async function(attrs) {
						var attachments = findAttachmentParts(attrs.struct);
						for (const attachment of attachments) {
						  var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
							bodies: [attachment.partID],
							struct: true 
						  });
						  //build function to process attachment message
						  //if(attachment.params.name === data.attachment[pos].params.name)
						  f.on('message', buildAttMessageFunction(attachment));
						}
					});
					msg.once('end', function() {
						//console.log(prefix + 'Finished');
					});
				});
				f.once('error', function(err) {
					//console.log('Fetch error: ' + err);
				});
				f.once('end', function() {
					//console.log('Done fetching all messages!');
					imap.end();
				});
			});
			// });
		});
	  
		imap.once('error', function(err) {
			//console.log(err);
		});

		imap.once('end', function() {
			console.log('Connection ended');
			res.send('download new succeed!')
		});

		imap.connect();
	}
	else	
	res.send('download succeed!')
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
    const { page, size, search, field, dir, status, mail } = req.query;
    var emailapis= await Mail.findOne({default: 1});
    var sortObject = {};
    sortObject.date=-1;
    if(search){
    var condition = { $or: [{ from: { $regex: new RegExp(search), $options: "i" }}, { subject: { $regex: new RegExp(search), $options: "i" }}, { text: { $regex: new RegExp(search), $options: "i" } } ]};
    }
    else
    var condition = {};
    //condition.email = emailapis.email;
    condition.viewstatus = status ? status : { $ne : 'Trash'};
	if(mail)
		condition.email = mail;
    //condition.email = mail ? mail : emailapis.email;
  
    sortObject[field] = dir;
    const { limit, offset } = getPagination(page, size);
    Table.paginate(condition, { collation: { locale: "en" }, populate: [], offset, limit, sort: sortObject })
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
// Find a single record with an id
exports.findOne = async(req, res) => {
    const id = req.params.id;
    var ms = await msg('invoices');
	await Table.findByIdAndUpdate(id, {viewstatus:'seen'}, {useFindAndModify:false});
    Table.findById(id)	
	  .populate('customer')
	  .populate('agent')
	  .populate('enquiry')
	  .populate('quote')
	  .populate('job')
	  .populate('invoice')
      .then((data) => {
        if (!data)
        res.status(404).send({ message: "OK"});
        else res.send(data);
      })
      .catch((err) => {
		  console.log(err);
        res.status(500).send({ message: "Invalid Mail uid"});
      });
  };
  
  // Find a single record with an id
exports.setRead = async(req, res) => {
    const id = req.params.id;
    var ms = await msg('invoices');
    Table.findByIdAndUpdate(id, {viewstatus:'seen'}, {useFindAndModify:false})
      .then((data) => {
        if (!data)
        res.status(404).send({ message: "OK"});
        else res.send({message:'Mail marked as seen.'});
      })
      .catch((err) => {
        res.status(500).send({ message: "Invalid Mail uid"});
      });
  };

// Update all records from the database.
exports.updateAll = async(req, res) => {
  //var ms = await msg('adminusers');
  const { ids, customer, agent, enquiry, quote, job, invoice } = req.query;
  var updates = {};
  if(customer) updates.customer = customer;
  if(agent) updates.agent = agent;
  if(enquiry) updates.enquiry = enquiry;
  if(quote) updates.quote = quote;
  if(job) updates.job = job;
  if(invoice) updates.invoice = invoice;
  await Table.updateMany(
   { _id: { $in: JSON.parse(ids) } }, 
   [{ $unset: ["customer", "agent", "enquiry", "quote", "job", "invoice"]}]);
  await Table.updateMany(
   { _id: { $in: JSON.parse(ids) } },
   { $set: updates })
    .then((data) => {
		//activity('Those mails has been updated successfully with job.', req.headers["user"], req.socket.remoteAddress.split(":").pop(), 'admin', req.session.useragent, req.session.useragent.updateAll);
      res.status(200).send({ message: 'Those mails has been updated successfully with job.'});
    })
    .catch((err) => {
      res.status(500).send({ message: 'Maybe record was not found!'});
    });
};

// Get all records from the database.
exports.list = async(req, res) => {
	const customers = await Customer.find();
	const agents = await Agent.find();
	const enquiries = await Enquiry.find();
	const quotes = await Quote.find();
	const jobs = await Job.find();
	const invoices = await Invoice.find();
	res.status(200).send({ customers: customers, agents: agents, enquiries: enquiries, quotes: quotes, jobs: jobs, invoices: invoices });
};