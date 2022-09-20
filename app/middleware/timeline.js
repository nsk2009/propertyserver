const timeline = async (opt, year) => {
	let today = new Date();
	today.setYear(year);
	let y = today.getFullYear();
	let m = ("0" + (today.getMonth() + 1)).slice(-2);
   	let d = ("0" + today.getDate()).slice(-2);
	let result = {};

	switch (opt) {
		
		case '1':
			result['begin'] = (today.getFullYear() - 1) + '-10-01T00:00:00.000Z';
			result['end'] = y + '-09-30T23:59:59.000Z';
			if(y+'-'+m+'-'+d+'T23:59:59.000Z' >= y + '-10-01T00:00:00.000Z') {
				result['begin'] = y + '-10-01T00:00:00.000Z';
				result['end'] = (today.getFullYear() + 1) + '-09-30T23:59:59.000Z';				
			}	
			break;
		case '2':
			const qt = Math.ceil(m/3);
			let fstart = ( qt * 3 ) - 2;
			result['begin'] = y + '-' + ("0" + (fstart)).slice(-2) + '-01T00:00:00.000Z';
            result['end'] = y + '-' + ("0" +(Number(fstart)+2)).slice(-2) +'-31T23:59:59.000Z';
			break;
		case '3':
            result['begin'] = y + '-' + m + '-01T00:00:00.000Z';
            result['end'] = y + '-' + m + '-31T23:59:59.000Z';
			break;
		case '4':
			today.setMonth(today.getMonth() - 1);
            result['begin'] = today.getFullYear() + '-' + ("0" + (today.getMonth()+1)).slice(-2) +  '-01T00:00:00.000Z';
            result['end'] = today.getFullYear() + '-' + ("0" + (today.getMonth()+1)).slice(-2) +  '-31T23:59:59.000Z';
			break;
		case '5':
			const lqt = Math.ceil(m/3);
			let lfstart = ( lqt * 3 ) - 5;
			if(lqt === 1)
				today.setFullYear(today.getFullYear() - 1);
			result['begin'] = today.getFullYear() + '-' + ("0" + (lfstart)).slice(-2) + '-01T00:00:00.000Z';
			result['end'] = today.getFullYear() + '-' + ("0" + (Number(lfstart)+2)).slice(-2) + '-31T23:59:59.000Z';
			break;
		case '6':
			return 'test';
			break;
		default:
			break;

	}
	return (result);
}

module.exports = timeline;
