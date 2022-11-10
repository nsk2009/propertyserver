const db = require("../models");
const Table = db.categories;
const Admin = db.adminusers;
const Settings = db.settings;
const msg = require("../middleware/message");
const activity = require("../middleware/activity");
const Imap = require('imap');

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
const set_id = '6275f6aae272a53cd6908c8d';



// Retrieve all records from the database.
exports.findAll = async (req, res) => {
  const imap = new Imap({
    user: 'moolahapp2022@gmail.com',
    password: 'qilbwgpxwuskqqnh',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    },
    authTimeout: 3000
  });

  var set = await Settings.findById(set_id);
var dt= [];


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
      var f = imap.seq.fetch(set.inbox_count+1 + ':*', { bodies: ['HEADER.FIELDS (FROM)','TEXT'] });
    f.on('message', async(msg, seqno)=> {
          console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function(stream, info) {
            console.log(prefix + 'Body');
            console.log('msg-' + seqno + '-body.txt');
            console.log(stream);
            dt.push(stream);
            console.log(stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt')));
            stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
    
          });
          msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function() {
            console.log(prefix + 'Finished');            
          });
          await Settings.findByIdAndUpdate(set_id, {inbox_count : seqno}, {useFindAndModify:false});
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
  res.send(dt);
};

