const nodemailer = require("nodemailer");
const mailgun = require("mailgun-js");
const sgMail = require('@sendgrid/mail')
var handlebars = require('handlebars');
var fs = require('fs');
const db = require("../models");
const Table = db.emailnotification;
const Api = db.emailapi;
const message = async(id, user, values, attach, content) => {		
	var val = await Table.findOne({ _id: id}).then();
	var mailcon = content ? content : val.content;
	var set = await Api.findOne({ user: user}).then();
	//console.log(set);
	var readHTMLFile = function(path, callback) {
		//console.log(set);
		fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
			if (err) {
			   callback(err); 
			   throw err;
				
			}
			else {
				callback(null, html);
			}
		});
	};
	if(set.default === 'GMail'){
		var guser = set.gmail_type === 'Live' ? set.live_gmail_username : set.sand_gmail_username;
		var gpass = set.gmail_type === 'Live' ? set.live_gmail_password : set.sand_gmail_password;
		var transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			auth: {
				user: guser,
				pass: gpass
			} 
		});
	}
	else if(set.default === 'Mailgun'){
		var api_key = set.mailgun_type === 'Live' ? set.live_mailgun_apikey : set.sand_mailgun_apikey;
		var domain = set.mailgun_type === 'Live' ? set.live_mailgun_domain : set.sand_mailgun_domain;
		var transporter = mailgun({ apiKey: api_key, domain: domain });
	}
	else if(set.default === 'MarSendgrid'){
		var api_key = set.noti_sendgrid_type === 'Live' ? set.noti_live_sendgrid_apikey : set.noti_sand_sendgrid_apikey;
		var transporter = sgMail.setApiKey(api_key);
	}
	
	readHTMLFile(__dirname + '/template/index.html', function(err, html) {
		//console.log(html);
		var template = handlebars.compile(html);
		var replacements = {
			 content: mailcon
		};
		var htmlToSend = template(replacements);
		var mapObj = values;//{cat:"dog",dog:"goat",goat:"cat"};
		var from = val.subject+' '+val.from;
		var to = val.to;
		var subject = val.subject;
		var str = mailcon;
		var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
		//console.log(re);
		str = str.replace(re, function(matched){
		  return mapObj[matched];
		});
		to = to.replace(re, function(matched){
		  return mapObj[matched];
		});
		from = from.replace(re, function(matched){
		  return mapObj[matched];
		});
		subject = subject.replace(re, function(matched){
		  return mapObj[matched];
		});		
		//console.log(str);
		htmlToSend = htmlToSend.replace('content', str);
		//'https://salesplanner.org/demo/property/server/uploads/1663415591197-stock-photo-1052601383.jpg'
		
		var filename = values['{attachment}'] ? values['{attachment}'].split('/').reverse()[0] : '';
		console.log(__basedir + values['{attachment}']);
		var mailOptions = {
			from: from,
			to : to,
			subject : subject,
			html : htmlToSend,
			attachments:values['{attachment}']? [
		        {   // file on disk as an attachment
		            filename: filename,
					path: __basedir + values['{attachment}']
					//content: new Buffer(FILE_CONTENT, 'base64'),
					//contentType: 'application/pdf'
					//streamSource: fs.createReadStream(values['{attachment}'])
					//filePath: values['{attachment}'] // stream this file
		        },
			]:null
		};
		if(set.default === 'GMail'){
			transporter.sendMail(mailOptions, function (error, response) {
			});
		}
		else if(set.default === 'Mailgun'){
			transporter.messages().send(mailOptions, function (error, response) {
			});
		}		
		else if(set.default === 'MarSendgrid'){
			mailOptions.from = 'moolahapp2022@gmail.com';
			transporter.send(mailOptions);
			/*.then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error.response.body)
  });*/
		}
	});

};

module.exports = message;
