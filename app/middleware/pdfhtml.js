const db = require("../models");
const Table = db.quotes;
const Invoice = db.invoices;
const TaxTable = db.taxes;
const SettingsTable = db.settings;

var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64'); 
}

const pdfheader = async() => {   
	var settings=await SettingsTable.findById('6275f6aae272a53cd6908c8d');
	var base64str = base64_encode('./uploads/logo_black.png');
	return(
		`<style>#header { padding: 0 !important; }</style><div id='header' style='padding: 10px 10px 0 10px !important; font-size: 10px;  width:100%; border-bottom: 0.5px solid #777A7A; display: inline-block; color: #777A7A;' ><table width="100%"><tr><td width="60%"><img class="p-2 " src=" data:image/png;base64,${base64str}" alt="Logo" width="250" >
		<p>Address<br />${settings.address}</p></td>
				<td>Email: ${settings.email}<br />
				Website: <a href="https://propertyconcierge.com.au/" target="_blank" id="website">propertyconcierge.com.au</a><br />
				Contact No: ${settings.phone}<br />
				ABN: ${settings.abn ? settings.abn : "987654321"}
			</td>
		</tr>
	</table></div>`
	);
}

const quotefooter = async() => {    
	var settings = await SettingsTable.findById('6275f6aae272a53cd6908c8d');
	return (`<style>#footer { padding: 0 !important; }</style><div id='footer' style='padding: 10px 0 !important; font-size: 8px;  width:100%; border-top: 1px solid #ddd; text-align: center; display: inline-block;
	color: #777A7A;'>${settings.copy}</div>`);
};

const quotehtml = async(id) => {    
	var record = await Table.findById(id).populate('customer').populate('agent');
   
	var taxes = await TaxTable.find({ status: 'ACTIVE'}).sort({name: 1});
	var items = '';
	record.items && record.items.map((row, idx) => {
		let [tit, des] = row.item.split("\n");
		var taxData = taxes.filter(function (el) {
			return el.taxType === row.tax;
		});
		items +=
			`<tr key=${idx}>
			  <td>${idx+1}</td>
			  <td style="max-width:400px;"><span>${tit}</span>
			  <p>${des}</p>
			  </td>
			  <td>${parseFloat(row.price).toFixed(2)}</td>
			  <td>${parseFloat(row.qty).toFixed(2)}</td>
			  <td>${taxData[0] && (taxData[0].name+' '+taxData[0].effectiveRate)}%</td>
			  <td class="text-end text-bold">${parseFloat(row.total).toFixed(2)}</td>
			</tr>`
	  })
	const data = `<table class="content">
		<tr>
			<th>Quote ID</th>
			<th>DATE</th>
			<th>Valid Untill</th>
			<th>Total Amount</th>
		</tr>
		<tr>
			<td>${record.uid ? record.uid: 'N/A'}</td>
			<td>${record.quote_date ? record.quote_date : 'N/A'}</td>
			<td>${record.expiry_date ? record.expiry_date : 'N/A'}</td>
			<td>${record.total?parseFloat(record.total).toFixed(2):'N/A'}</td>
		</tr>
		<tr>
			<th colspan="2">Contact Address</th>
			<th colspan="2">Job Location</th>
		</tr>
		<tr>
			<td colspan="2">
				${record.usertype === 'customer' ? record.customer.firstname: record.agent.name}<br />
				${record.usertype === 'customer' ? record.customer.address: record.agent.address}<br />
				Phone: +${record.usertype === 'customer' ? record.customer.phone: record.agent.phone}
			</td>
			<td colspan="2">
				${record.usertype === 'customer' ? record.customer.firstname: record.agent.name}<br />
				${record.usertype === 'customer' ? record.customer.address: record.agent.address}<br />
				Phone: +${record.usertype === 'customer' ? record.customer.phone: record.agent.phone}
			</td>
		</tr>
		<tr>
			<th colspan="4">Description</th>
		</tr>
		<tr>
			<td colspan="4">${record.description ? record.description : 'N/A' }</td>
		</tr>
	</table>
	  <table>
		  <thead>
			<tr class="table-active">
			<th>#</th>
			  <th>Item</th>
			  <th>Price($)</th>
			  <th>Quantity</th>
			  <th align="col">Tax </th>
			  <th class="text-end">
				Amount (<span class="currencysymbol">$</span>)
			  </th>
			</tr>
		  </thead>
		  <tbody id="products-list">		 
		  ${items}
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Sub Total</td>
			  <td class="text-end text-bold">${record.subtotal ? parseFloat(record.subtotal).toFixed(2):'N/A'}</td>
			</tr>
			
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Tax Amount </td>
			  <td class="text-end text-bold">${record.taxamt?parseFloat(record.taxamt).toFixed(2):'N/A'}</td>
			</tr>
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Net Total</td>
			  <td class="text-end text-bold">${record.total?parseFloat(record.total).toFixed(2):'N/A'} </td>
			</tr>
		  </tbody>
		</table>
			<p><span class="text-bold">NOTE:</span></p>
			${record.terms?record.terms:'N/A' } 
	  `;
	  return (data);
};

const invoicehtml = async(id) => {    
	var record = await Invoice.findById(id).populate('customer').populate('agent');
   if(record){
	var taxes = await TaxTable.find({ status: 'ACTIVE'}).sort({name: 1});
	var items = '';
	record.items && record.items.map((row, idx) => {
		let [tit, des] = row.item.split("\n");
		var taxData = taxes.filter(function (el) {
			return el.taxType === row.tax;
		});
		items +=
			`<tr key=${idx}>
			  <td>${idx+1}</td>
			  <td style="max-width:400px;"><span>${tit}</span>
			  <p>${des}</p>
			  </td>
			  <td>${parseFloat(row.price).toFixed(2)}</td>
			  <td>${parseFloat(row.qty).toFixed(2)}</td>
			  <td>${taxData[0] && (taxData[0].name+' '+taxData[0].effectiveRate)}%</td>
			  <td class="text-end text-bold">${parseFloat(row.total).toFixed(2)}</td>
			</tr>`
	  })
	const data = `<table class="content">
		<tr>
			<th>Invoice ID</th>
			<th>Issued Date</th>
			<th>Due On</th>
			<th>Total Amount</th>
		</tr>
		<tr>
			<td>${record.uid ? record.uid: 'N/A'}</td>
			<td>${record.issuedate ? record.issuedate : 'N/A'}</td>
			<td>${record.duedate ? record.duedate : 'N/A'}</td>
			<td>${record.total?parseFloat(record.total).toFixed(2):'N/A'}</td>
		</tr>
		<tr>
			<th colspan="2">Contact Address</th>
			<th colspan="2">Job Location</th>
		</tr>
		<tr>
			<td colspan="2">
				${record.usertype === 'customer' ? record.customer.firstname: record.agent.name}<br />
				${record.usertype === 'customer' ? record.customer.address: record.agent.address}<br />
				Phone: +${record.usertype === 'customer' ? record.customer.phone: record.agent.phone}
			</td>
			<td colspan="2">
				${record.usertype === 'customer' ? record.customer.firstname: record.agent.name}<br />
				${record.usertype === 'customer' ? record.customer.address: record.agent.address}<br />
				Phone: +${record.usertype === 'customer' ? record.customer.phone: record.agent.phone}
			</td>
		</tr>
	</table>
	  <table>
		  <thead>
			<tr class="table-active">
			<th>#</th>
			  <th>Item</th>
			  <th>Price($)</th>
			  <th>Quantity</th>
			  <th align="col">Tax </th>
			  <th class="text-end">
				Amount (<span class="currencysymbol">$</span>)
			  </th>
			</tr>
		  </thead>
		  <tbody id="products-list">		 
		  ${items}
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Sub Total</td>
			  <td class="text-end text-bold">${record.subtotal ? parseFloat(record.subtotal).toFixed(2):'N/A'}</td>
			</tr>
			
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Tax Amount </td>
			  <td class="text-end text-bold">${record.taxamt?parseFloat(record.taxamt).toFixed(2):'N/A'}</td>
			</tr>
			<tr>
			  <td colSpan="4"></td>
			  <td class="text-bold">Net Total</td>
			  <td class="text-end text-bold">${record.total?parseFloat(record.total).toFixed(2):'N/A'} </td>
			</tr>
		  </tbody>
		</table>
			<p><span class="text-bold">NOTE:</span></p>
			${record.terms?record.terms:'N/A' } 
	  `;
	  return (data); 
   }
   else return '';
};
const date = {
    quotehtml,
	pdfheader,
	quotefooter,
	invoicehtml
};
module.exports = date;