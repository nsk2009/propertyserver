const db = require("../models");
const Table = db.quotes;
const TaxTable = db.taxes;
const SettingsTable = db.settings;

const pdfheader = async() => {   
	var settings=await SettingsTable.findById('6275f6aae272a53cd6908c8d');
	return(
`<div class="col-lg-12 ">
	<div class=" border-bottom-dashed p-4 ml-50 " >
		<div class="d-flex">
			<div class="flex-grow-1">
			<img class="p-2 " src="/uploads/logo_black.png" alt="Logo"  >
			<div class="mt-sm-5 mt-4">
				<h6 class="text-muted text-uppercase fw-semibold">Address</h6>
				<p class="text-muted mb-1" id="address-details">${settings.address}</p>
				</div>
			</div>
			<div class="flex-shrink-0 mt-sm-0 mt-3">
			<h6><span class="m-r-2">Email:</span><span class="text-muted fw-normal " id="email">${settings.email}</span>
			</h6>
			<h6><span class="m-r-2">Website:</span><a href="https://propertyconcierge.com.au/" class="link-primary" target="_blank" id="website">propertyconcierge.com.au</a></h6><h6 class="mb-0"><span class="m-r-2">Contact No:</span><span class="text-muted fw-normal " id="contact-no">${settings.phone}</span></h6>
			<h6 class="mb-0"><span class="m-r-2">ABN:</span><span class="text-muted fw-normal " id="abn">${settings.abn ? settings.abn : "987654321"}</span></h6>
			</div>
		</div>
	</div>
	</div>`
	);
}

const quotehtml = async(id) => {    
   var record = await Table.findById(id).populate('customer').populate('createdBy');
   
 var taxes = await TaxTable.find({ status: 'ACTIVE'}).sort({name: 1});
//    console.log(record);	
   const data = `<div class="col-lg-12 mt-2" ref={componentRef}  id='main-content'>
		  <div class="card-body  m-30" >
			<div class="row mb-2">
			  <div class="col-lg-12">
			  </div>
			  <div class="col-lg-12">
			<div class="card-body p-4">
			  <div class="row g-3 d-flex ml-10">
				<div class="col-lg-3 w-20 col-6">
				  <p class="text-muted mb-2 text-uppercase fw-semibold">
					Quote ID
				  </p>
				  <h5 class="fs-14 text-info mb-0">
				  ${record.uid ? record.uid: 'N/A'}
					<span id="invoice-no"></span>
				  </h5>
				</div>
				<div class="col-lg-3 w-20 col-6">
				  <p class="text-muted mb-2 text-uppercase fw-semibold">
				  DATE
				  </p>
				  <h5 class="fs-14 mb-0">
					<span id="invoice-date ">${record.quote_date ? record.quote_date : 'N/A'}<small class="text-muted m-l-10">
					</small></span>
				  </h5>
				</div>
				<div class="col-lg-3 w-20 col-6">
				  <p class="text-muted mb-2 text-uppercase fw-semibold">
				  Valid Untill
					</p>
				  <h5 class="fs-14 mb-0">
					<span id="invoice-date ">${record.expiry_date ? record.expiry_date : 'N/A'}<small class="text-muted m-l-10">
					  
					</small></span>
					
				  </h5>
				</div>
				<div class="col-lg-3 col-6">
				  <p class="text-muted mb-2 text-uppercase fw-semibold">
					Total Amount
				  </p>
				  <h5 class="fs-14 mb-0">
					<span id="total-amount">${record.total?parseFloat(record.total).toFixed(2):'N/A'} </span>
				  </h5>
				</div>
			  </div>
			  
			</div>
		  </div>
		  <div class="col-lg-12">
			<div class="card-body p-4 border-top border-top-dashed mb-3">
			  <div class="row g-3 float-left d-flex mb-3">
				<div class="col-lg-6 float-left col-6">
				  <h6 class="text-muted text-uppercase fw-semibold mb-3">
					Customer Address
				  </h6>
				  <p class="fw-medium mb-2" id="billing-name">
				  ${record.customer? record.customer.firstname: 'N/A'}
				  </p>
				  <p
					class="text-muted mb-1"
					id="billing-address-line-1"
				  >
				   ${record.customer? record.customer.address: 'N/A'}
				  </p>
				  <p class="text-muted mb-1">
					<span>Phone: +</span>
					<span id="billing-phone-no">  ${record.customer? record.customer.phone: 'N/A'}</span>
				  </p>
				  <p class="text-muted mb-0">
					<span>Tax:</span>
					<span id="billing-tax-no">12-3456789</span>
				  </p>
				</div>

				<div class="col-lg-6 float-left col-6">
				  <h6 class="text-muted text-uppercase fw-semibold mb-3">
					Job Location
				  </h6>
				  <p class="fw-medium mb-2" id="shipping-name">
				  ${record.customer? record.customer.firstname: 'N/A'}
				  </p>
				  <p
					class="text-muted mb-1"
					id="shipping-address-line-1"
				  >
					 ${record.customer? record.customer.address: 'N/A'}
				  </p>
				  <p class="text-muted mb-1">
					<span>Phone: +</span>
					<span id="shipping-phone-no">${record.customer? record.customer.phone: 'N/A'}</span>
				  </p>
				</div>
				
			  </div>
			  <div class="col-lg-12 mt-3 m-10">
				<h6 class="text-muted text-uppercase fw-semibold ">
					Quote Description
				  </h6>
				  <p class="fw-medium " >
					${record.description? record.description: 'N/A' } 
				  </p>
				</div>
			</div>
		  </div>
		  <div class="col-lg-12">
			<div class="card-body p-4">
			<div class="table-responsive m-0 mb-3">
				  <div class="border-top border-top-dashed ">
					<table class="table table-borderless text-center table-nowrap align-middle mb-0">
					  <thead>
						<tr class="table-active">
						<th scope="col">#</th>
						  <th scope="col">Item</th>
						  <th scope="col">Price($)</th>
						  <th scope="col">Quantity</th>
						  <th align="col">Tax </th>
						  <th scope="col" class="text-end">
							Amount (<span class="currencysymbol">$</span>)
						  </th>
						</tr>
					  </thead>
					  <tbody id="products-list">
					  ${record.items && record.items.map((row, idx) => {
						let [tit, des] = row.item.split("\n");
						var taxData = taxes.filter(function (el) {
							return el.taxType === row.tax;
						});
						return(
					`<tr key=${idx}>
					  <td>${idx+1}</td>
					  <td class="text-start fw-medium" style="max-width:400px;"><span>${tit}</span>
					  <p class="text-muted textwrap mb-0">${des}</p>
					  </td>
					  <td>${row.price?row.price:'N/A'}.00</td>
					  <td>${row.qty?row.qty:'N/A'}</td>
					  <td className="text-start fw-medium ">${taxData[0] && (taxData[0].name+' '+taxData[0].effectiveRate)}%</td>
					  <td class="text-end">${row.total?row.total:'N/A'}.00</td>
					</tr>`
					  )})}
					<tr class="border-top border-top-dashed mt-2">
						  <td colSpan="4"></td>
						  <td colSpan="2" class="fw-medium nopadding p-0">
							<table class="table table-borderless text-start table-nowrap align-middle mb-0 font-weight-bold">
							  <tbody>
								<tr>
								  <td>Sub Total</td>
								  <td class="text-end">${record.subtotal ? parseFloat(record.subtotal).toFixed(2):'N/A'}</td>
								</tr>
								
								<tr class="border-top border-top-dashed">
								  <td scope="row">Tax Amount </td>
								  <td class="text-end">${record.taxamt?parseFloat(record.taxamt).toFixed(2):'N/A'}</td>
								</tr>
								<tr class="border-top border-top-dashed">
								  <td scope="row">Net Total</td>
								  <td class="text-end">${record.total?parseFloat(record.total).toFixed(2):'N/A'} </td>
								</tr>
							  </tbody>
							</table>
						  </td>
						</tr>
					  </tbody>
					</table>
				  </div>
				</div>
				<div class="mt-4 ">
				<div class="alert alert-info">
					<p class="mb-0 fs-xs"><span class="fw-semibold">NOTE:</span>
					<span id="note">${record.terms?record.terms:'N/A' } 
					</span>
					</p>
					</div>
				</div>
				</div>
		  </div>
		   </div>
		  </div>
		 
		</div>
	  </div>`;
	  return (data);
};

const quotefooter = async(id) => {    
	var record = await Table.findById(id).populate('customer').populate('createdBy');
	var settings=await SettingsTable.findById('6275f6aae272a53cd6908c8d');
	return (
		`<footer class="footer">
			<div class="container-fluid">
				<div class="row">
					<div class="col-sm-12" style="text-align: center;">
					${settings.copy}
					</div>
				</div>
			</div>
		</footer>`
	);
};
const date = {
    quotehtml,
	pdfheader,
	quotefooter,

};
module.exports = date;