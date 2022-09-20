const fs = require('fs');
const { networkInterfaces } = require('os');
const os = require('os');
var rp = require('request-promise');
const activity = async (message, user, ip, type, session, icon) => {
	//const data = "Append this data at the end of the file.\n";
	let date_ob = new Date();
	// adjust 0 before single digit date
	let date = ("0" + date_ob.getDate()).slice(-2);

	// current month
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

	// current year
	let year = date_ob.getFullYear();

	// current hours
	let hours = ("0" + date_ob.getHours()).slice(-2);

	// current minutes
	let minutes = ("0" + date_ob.getMinutes()).slice(-2);

	// current seconds
	let seconds = ("0" + date_ob.getSeconds()).slice(-2);

	let datetime = year + "-" + month + "-" + date + ' '+ hours + ":" + minutes + ":" + seconds
	// prints date in YYYY-MM-DD format
	//console.log(year + "-" + month + "-" + date);
	var dir = './activities';

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	var dir = './activities/'+type;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	var dir = './activities/'+type+'/'+user;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	var dir = './activities/'+type+'/'+user+'/'+year;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	var dir = './activities/'+type+'/'+user+'/'+year+'/'+month;

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	
	
	const nets = networkInterfaces();
	const results = []; // Or just '{}', an empty object

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			if (net.family === 'IPv4' && !net.internal) {
				/*if (!results[name]) {
					results[name] = [];
				}*/
				results.push(net.address);
			}
		}
	}
	//console.log(results);
	
	const networkInterfacess = os.networkInterfaces();
//var ips = networkInterfacess['eth0'][0]['address']

//console.log(networkInterfacess);
const options1 = {
	method: "GET",
	uri: 'https://aparajayah.com/hrm/employee/emplogin/getIPaddress',
};
	var ip = await rp(options1);
	var device = session.isMobile ? 'Mobile' : 'Desktop/Laptop';
	session.date = datetime;
	session.result = ip;//results[0];
	session.message = message;
	session.device = device;
	session.icon = icon;
//		const data = datetime+'#'+results[0]+'#'+message+ '#' +session.browser+ '#' +session.version+ '#' + device + '#' +session.os+ '#'+session.platform +'#'+ icon + "\n"
	
	fs.writeFile('./activities/'+type+'/'+user+'/'+year+'/'+month+'/'+date+'.txt', JSON.stringify(session)+',', {flag: 'a+'}, (err) => {
		if (err) {
			throw err;
		}
	});

};

module.exports = activity;
