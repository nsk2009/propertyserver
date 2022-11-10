const db = require("../models");
const Admin = db.adminusers;
const Settings = db.settings;
const EmailApi = db.emailapi;
const Table = db.inbox;
const Imap = require('imap');
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
  //['SUBJECT', 'Give Subject Here']]
  imap.once('ready', function() {
    var fs = require('fs'), fileStream;
    openInbox(async(err, box) =>{
      if (err) throw err;
      // imap.search([ 'UNSEEN', ['SINCE', 'Sep 20, 2022'] ], function(err, results) {
      //   if (err) throw err; 
      // var f = imap.fetch(results, { bodies: '' });
      var f = imap.seq.fetch(set.inbox_count+1 + ':*', { bodies: '' });
    f.on('message', async(msg, seqno)=> {
          console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', async(stream, info)=> {
            simpleParser(stream, async(err, mail) => {
              console.log(mail.subject, 'subject');        
              var data = {};
              data.subject= mail.subject;
              data.email= email;
              data.from= mail.from ? mail.from.text : '';
              data.date= mail.date;
              // data.to= mail.to ? mail.to.text : '';
              data.html= mail.html;
              data.text= mail.text;
              data.uid= seqno;
              var exist = await Table.findOne({uid:seqno, email:email}).then((res)=>{return res;}).catch((e)=>{return '';});
              if(!exist)
              await Table.create(data);        
            });
            await Settings.findByIdAndUpdate(set_id, {inbox_count : seqno}, {useFindAndModify:false});
          });
          msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function() {
            console.log(prefix + 'Finished');            
          });
          
          // simpleParser(stream, async (err, parsed) => {
          //   const {from, subject, textAsHtml, text, attachments} = parsed;
          //   res.send({from: from, subject:subject, html: textAsHtml});
          // });
        });
        f.once('error', function(err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    // });
  });
  
  imap.once('error', function(err) {
    console.log(err);
  });
  
  imap.once('end', function() {
    console.log('Connection ended');
  });
  
  imap.connect();
//   res.send(dt);

// var imaps = require('imap-simple');
// const simpleParser = require('mailparser').simpleParser;
// const _ = require('lodash');

// var config = {
//     imap: {
// 		user: emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username,
// 		password: emailapis.gmail_type==='Live' ? emailapis.live_gmail_password : emailapis.sand_gmail_password,
// 		host: 'imap.gmail.com',
// 		port: 993,
// 		tls: true,
// 		tlsOptions: {
// 		  rejectUnauthorized: false
// 		},
//         authTimeout: 3000
//     }
// };
// imaps.connect(config).then(function (connection) {
//     return connection.openBox('INBOX').then(function () {
//         var searchCriteria = [(set.inbox_count+1)+':*'];
//         // console.log(searchCriteria);
//         var fetchOptions = {
//             bodies: ['HEADER', 'TEXT', ''],
//         };
//         return connection.search(searchCriteria, fetchOptions).then(function (messages) {
//             messages.forEach(async(item)=> {
//                 var all = _.find(item.parts, { "which": "" })
//                 var id = item.attributes.uid;
//                 var idHeader = "Imap-Id: "+id+"\r\n";
//                 console.log(id, 'id');
//                 simpleParser(idHeader+all.body, async(err, mail) => {
//                     // access to the whole mail object
//                     // console.log(mail, 'mail');                    
//                     var data = {};
//                     data.subject= mail.subject;
//                     data.from= mail.from.text;
//                     data.date= mail.date;
//                     data.to= mail.to.text;
//                     data.html= mail.html;
//                     data.text= mail.text;
//                     data.uid= id;
//                     var exist = await Table.findOne({uid:id}).then((res)=>{return res;}).catch((e)=>{return '';});
//                     if(!exist)
//                     await Table.create(data);
//                 });
//                 await Settings.findByIdAndUpdate(set_id, {inbox_count : id}, {useFindAndModify:false});
//             });
//         });
//     });
// });
res.send('Mails sync succeed!')
};

// Retrieve all records from the database.
exports.findAll = async(req, res) => {
    const { page, size, search, field, dir, status, show } = req.query;
    var emailapis= await EmailApi.findById(emailapi_id);
    var sortObject = {};
    sortObject.date=-1;
    if(search){
    var condition = { $or: [{ from: { $regex: new RegExp(search), $options: "i" }}, { subject: { $regex: new RegExp(search), $options: "i" }}, { text: { $regex: new RegExp(search), $options: "i" } } ]};
    }
    else
    var condition = {};
   condition.email = emailapis.gmail_type==='Live' ? emailapis.live_gmail_username : emailapis.sand_gmail_username;
    condition.viewstatus = status ? status : { $ne : 'Trash'};
    if(show) condition.show = show;
  
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
    Table.findById(id)
      .then((data) => {
        if (!data)
        res.status(404).send({ message: "OK"});
        else res.send(data);
      })
      .catch((err) => {
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