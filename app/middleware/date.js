const fromto = (period, trial) => {    
    //let start = '2021-02-01';//new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    let start = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    let today = new Date(start);
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yy = today.getFullYear();
    var leap = yy%4 === 0 ? 1 : 0;
    var feb = leap ? 29 : 28;
    let months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var edd = dd;
    if(dd > 1)
    mm++;
	if(trial > 0){
		var nt = new Date(start);	
		nt.setDate(nt.getDate() + trial -1);	
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		end = yy+"-" + mm + "-" + dd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
	}
	else if(period === 'yearly'){
		mm = today.getMonth()+1;
		if(leap && mm === 2)
		dd = today.getDate()-1;		
		yy = today.getFullYear()+1;
		edd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var next = yy+'-'+mm+'-'+edd;
		var nt = new Date(next);	
		nt.setDate(nt.getDate() - 1);	
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		end = yy+"-" + mm + "-" + dd;
	}
    else if(dd === 1){
        var edd = months[mm-1];
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var end = yy+'-'+mm+'-'+edd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		//let next = new Date(start);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
    }
    else if(dd > 28){
        if(dd > 28 && mm === 2 )
        var edd = months[1];
        else if(dd > 29 && (mm === 4 || mm === 6 || mm === 9 || mm === 11))
        var edd = 30;
        else
        var edd = 31;
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var end = yy+'-'+mm+'-'+edd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
    }  
	else{	
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var next = yy+'-'+mm+'-'+edd;
		var nt = new Date(next);
		nt.setDate(nt.getDate() - 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		end = yy+"-" + mm + "-" + dd;
	}
	return { start : start, end: end, next: next };
}

const everymonth = (period, trial) => {    
    //let start = '2021-02-10';//new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    let start = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    let today = new Date(start);
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yy = today.getFullYear();
    var leap = yy%4 === 0 ? 1 : 0;
    var feb = leap ? 29 : 28;
    let months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var edd = dd;
    /*if(dd > 1)
    mm++;*/
	if(trial > 0){
		var nt = new Date(start);	
		nt.setDate(nt.getDate() + trial -1);	
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		end = yy+"-" + mm + "-" + dd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
	}
	else if(period === 'lifetime'){
		end = 'lifetime';
		next = 'lifetime';
	}
	else if(period === 'yearly'){
		mm = today.getMonth()+1;
		if(leap && mm === 2)
		dd = today.getDate()-1;		
		yy = today.getFullYear()+1;
		edd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var next = yy+'-'+mm+'-'+edd;
		var nt = new Date(next);	
		nt.setDate(nt.getDate() - 1);	
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		end = yy+"-" + mm + "-" + dd;
	}
    else if(dd === 1){
        var edd = months[mm-1];
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var end = yy+'-'+mm+'-'+edd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		//let next = new Date(start);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
    }
    else if(dd > 28){
        if(dd > 28 && mm === 2 )
        var edd = months[1];
        else if(dd > 29 && (mm === 4 || mm === 6 || mm === 9 || mm === 11))
        var edd = 30;
        else
        var edd = 31;
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var end = yy+'-'+mm+'-'+edd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
    }  
	else{	
        var edd = months[mm-1];
		edd = ('0' + edd).slice(-2);
		mm = ('0' + mm).slice(-2);
		var end = yy+'-'+mm+'-'+edd;
		var nt = new Date(end);
		nt.setDate(nt.getDate() + 1);
		var dd = nt.getDate();
		var mm = nt.getMonth()+1;
		var yy = nt.getFullYear();
		dd = ('0' + dd).slice(-2);
		mm = ('0' + mm).slice(-2);
		next = yy+"-" + mm + "-" + dd;
	}
	return { start : start, end: end, next: next };
}

const feecalc = (amount) => { 
    let start = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    let today = new Date(start);
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yy = today.getFullYear();
    var leap = yy%4 === 0 ? 1 : 0;
    var feb = leap ? 29 : 28;
    let months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var days = months[mm];
	var amt = (amount/days)*(days-dd+1);
	return amt.toFixed(2);
}

const date = {
    fromto,
	everymonth,
	feecalc
};
module.exports = date;