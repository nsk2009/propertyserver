const Moment = require('moment-timezone');
Moment.tz.setDefault("Asia/Calcutta");
const timeline = async (opt, year) => {
	let result = {};
	switch (opt) {		
		case '0':
			result['begin'] = Moment().startOf('day').toISOString();
			result['end'] = Moment().endOf('day').toISOString();	
			break;		
		case '1':
			result['begin'] = Moment().startOf('year').toISOString();
			result['end'] = Moment().endOf('year').toISOString();	
			break;	
		case '8':			
			result['begin'] = Moment().subtract(1, 'year').startOf('year').toISOString();
			result['end'] = Moment().subtract(1, 'year').endOf('year').toISOString();
			break;
		case '2':
			result['begin'] = Moment().startOf('quarter').toISOString();
			result['end'] = Moment().endOf('quarter').toISOString();
			break;
		case '3':
			result['begin'] = Moment().subtract(1, 'month').startOf('month').toISOString();
			result['end'] = Moment().subtract(1, 'month').endOf('month').toISOString();
			break;
		case '4':;
			result['begin'] = Moment().startOf('month').toISOString();
			result['end'] = Moment().endOf('month').toISOString();
			break;
		case '5':			
			result['begin'] = Moment().subtract(1, 'quarter').startOf('quarter').toISOString();
			result['end'] = Moment().subtract(1, 'quarter').endOf('quarter').toISOString();
			break;
		case '6':			
			result['begin'] = Moment().startOf('week').toISOString();
			result['end'] = Moment().endOf('week').toISOString();
			break;
		default:
			break;
	}
	return (result);
}

module.exports = timeline;
