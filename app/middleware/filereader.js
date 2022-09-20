const filereader = async(user, id, from, to) => {
	const fs = require('fs');
	var sprintf = require('sprintf-js').sprintf;
	const date1 = new Date(from);
	const date2 = new Date(to);
	const diffTime = Math.abs(date2 - date1);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	var data = [];	
	var dateVar = date1; 
	 for (let i = 0; i <= diffDays; i++) {
	var currentdate = dateVar.getFullYear()+'/'+sprintf('%02d',(dateVar.getMonth()+1))+'/'+sprintf('%02d',dateVar.getDate());
	//console.log(currentdate);
	var file = './activities/'+ user +'/'+ id +'/'+dateVar.getFullYear()+'/'+sprintf('%02d',(dateVar.getMonth()+1))+'/'+sprintf('%02d',dateVar.getDate())+'.txt';
	if(!data[i])
		data[i] = {};
	data[i]['date'] = currentdate;
	data[i]['data'] = '';
	if (fs.existsSync(file))
		var logdata = await fs.promises.readFile(file, 'utf8');
	//console.log(file);
		if(logdata){
		data[i]['data'] = JSON.parse('['+logdata+'{}]');
		//console.log(data[i]['data']);
		}
		logdata = '';
		dateVar.setDate(dateVar.getDate()+1);		
	}

	return data;
}

module.exports = filereader;
