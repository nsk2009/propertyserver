const quotehtml = () => {    
   
	return (
		`<div className="col-lg-12 container" ref={componentRef}  id='main-content'>
		<div className="card ">
		  <div className="card-body " >
			<div className="row mb-2">
			  <div className="col-lg-12">
			  <div className="card-header border-bottom-dashed p-4 ">
			  <div className="d-flex">
				<div className="flex-grow-1">
				  <img  
					className="bg-dark p-2"
					src={require("../../assets/images/logo-dark.png")}
					alt="" height="60"
				  />
				  <div className="mt-sm-5 mt-4">
					<h6 className="text-muted text-uppercase fw-semibold">
					  Address
					</h6>
					<p className="text-muted mb-1" id="address-details">
					{record.createdBy? record.createdBy.country: 'N/A'}  
					</p>
					<p className="text-muted mb-0" id="zip-code">
					  <span>Zip-code:</span>
					  2011
					</p>
				  </div>
				</div>
				<div className="flex-shrink-0 mt-sm-0 mt-3">
				  <h6>
					<span className=" m-r-2">
					  Legal Registration No:
					</span>
					<span id="legal-register-no text-muted fw-normal ">987654</span>
				  </h6>
				  <h6>
					<span className="m-r-2">Email:</span>
					<span className="text-muted fw-normal " id="email">{record.customer?record.customer.email:'N/A' }</span>
				  </h6>
				  <h6>
					<span className="m-r-2">
					  Website:
					</span>
					<a  href={websiteurl} className="link-primary" target="_blank" id="website" >
					 {record.createdBy? record.createdBy.website: 'N/A'}  
					</a>
				  </h6>
				  <h6 className="mb-0">
					<span className="m-r-2">
					  Contact No:
					</span>
					<span className="text-muted fw-normal " id="contact-no">{record.createdBy ? record.createdBy.mobile: 'N/A'}</span>
				  </h6>
				</div>
			  </div>
			</div>
			  </div>
			  <div className="col-lg-12">
			<div className="card-body p-4">
			  <div className="row g-3">
				<div className="col-lg-3 col-6">
				  <p className="text-muted mb-2 text-uppercase fw-semibold">
					Quote ID
				  </p>
				  <h5 className="fs-14 text-info mb-0">
				  {record.uid? record.uid: 'N/A'}
					<span id="invoice-no"></span>
				  </h5>
				</div>
				<div className="col-lg-3 col-6">
				  <p className="text-muted mb-2 text-uppercase fw-semibold">
				  DATE
				  </p>
				  <h5 className="fs-14 mb-0">
					<span id="invoice-date ">{record.customer ? DateService.dateonly(record.quote_date) : 'N/A'}<small className="text-muted m-l-10">
					</small></span>
				  </h5>
				</div>
				<div className="col-lg-3 col-6">
				  <p className="text-muted mb-2 text-uppercase fw-semibold">
				  Valid Untill
					</p>
				  <h5 className="fs-14 mb-0">
					<span id="invoice-date ">{record.customer ? DateService.dateonly(record.expiry_date) : 'N/A'}<small className="text-muted m-l-10">
					  
					</small></span>
					
				  </h5>
				</div>
				<div className="col-lg-3 col-6">
				  <p className="text-muted mb-2 text-uppercase fw-semibold">
					Total Amount
				  </p>
				  <h5 className="fs-14 mb-0">
					<span id="total-amount">{record.total?parseFloat(record.total).toFixed(2):'N/A'} </span>
				  </h5>
				</div>
			  </div>
			</div>
		  </div>
		  <div className="col-lg-12">
			<div className="card-body p-4 border-top border-top-dashed">
			  <div className="row g-3">
				<div className="col-6">
				  <h6 className="text-muted text-uppercase fw-semibold mb-3">
					Customer Address
				  </h6>
				  <p className="fw-medium mb-2" id="billing-name">
				  {record.customer? record.customer.firstname: 'N/A'}
				  </p>
				  <p
					className="text-muted mb-1"
					id="billing-address-line-1"
				  >
				   {record.customer? record.customer.address: 'N/A'}
				  </p>
				  <p className="text-muted mb-1">
					<span>Phone: +</span>
					<span id="billing-phone-no">  {record.customer? record.customer.phone: 'N/A'}</span>
				  </p>
				  <p className="text-muted mb-0">
					<span>Tax:</span>
					<span id="billing-tax-no">12-3456789</span>
				  </p>
				</div>

				<div className="col-6">
				  <h6 className="text-muted text-uppercase fw-semibold mb-3">
					Job Location
				  </h6>
				  <p className="fw-medium mb-2" id="shipping-name">
				  {record.customer? record.customer.firstname: 'N/A'}
				  </p>
				  <p
					className="text-muted mb-1"
					id="shipping-address-line-1"
				  >
					 {record.customer? record.customer.address: 'N/A'}
				  </p>
				  <p className="text-muted mb-1">
					<span>Phone: +</span>
					<span id="shipping-phone-no">{record.customer? record.customer.phone: 'N/A'}</span>
				  </p>
				</div>
				<div className="col-lg-12">
				<h6 className="text-muted text-uppercase fw-semibold mb-3">
					Quote Description
				  </h6>
				  <p className="fw-medium mb-2" >
					<div dangerouslySetInnerHTML={{ __html: record.description? record.description: 'N/A' }} />
				  </p>
				</div>
			  </div>
			</div>
		  </div>
		  <div className="col-lg-12">
			<div className="card-body p-4">
			<div className="table-responsive">
				  <div className="border-top border-top-dashed mt-2">
					  <table className="table table-borderless text-center table-nowrap align-middle mb-0">
					  <thead>
						<tr className="table-active">
						<th scope="col">#</th>
						  <th scope="col">Item</th>
						  <th scope="col">Price($)</th>
						  <th scope="col">Quantity</th>
						  <th align="col">Discount </th>
						  <th scope="col" className="text-end">
							Amount (<span className="currencysymbol">$</span>)
						  </th>
						</tr>
					  </thead>
					  <tbody id="products-list">
					  {record.items.map((row, idx) => {let [tit, des] = row.item.split("\n");return(
					<tr  key={idx}>
					  <td>{idx+1}</td>
					  <td className="text-start fw-medium"><span>{tit}</span>
					  <p className="text-muted mb-0">{des}</p>
					  </td>
					  <td>{row.price?row.price:'N/A'}.00</td>
					  <td>{row.qty?row.qty:'N/A'}</td>
					  <td>{row.discount?row.discount:'N/A'}</td>
					  <td className="text-end">{row.total?row.total:'N/A'}.00</td>
					</tr>
					  )})}
					<tr className="border-top border-top-dashed mt-2">
						  <td colSpan="4"></td>
						  <td colSpan="2" className="fw-medium nopadding p-0">
							<table className="table table-borderless text-start table-nowrap align-middle mb-0 font-weight-bold">
							  <tbody>
								<tr>
								  <td>Sub Total</td>
								  <td className="text-end">{record.subtotal?parseFloat(record.subtotal).toFixed(2):'N/A'}</td>
								</tr>
								<tr>
								  <td scope="row ">	Discount({record.discount?record.discount: ''}%)</td>
								  <td className="text-end">{record.discamt?parseFloat(record.discamt).toFixed(2):'N/A'}</td>
								</tr>
								<tr>
								  <td scope="row">Gross Total</td>
								  <td className="text-end">{record.grosstotal?parseFloat(record.grosstotal).toFixed(2):'N/A'}</td>
								</tr>
								<tr className="border-top border-top-dashed">
								  <td scope="row">Tax ({record.taxname?record.taxname:'N/A'} {record.taxrate?record.taxrate:'N/A'}% {record.taxtype?record.taxtype:'N/A'}) </td>
								  <td className="text-end">{record.taxamt?parseFloat(record.taxamt).toFixed(2):'N/A'}</td>
								</tr>
								<tr className="border-top border-top-dashed">
								  <td scope="row">Net Total</td>
								  <td className="text-end">{record.total?parseFloat(record.total).toFixed(2):'N/A'} </td>
								</tr>
							  </tbody>
							</table>
						  </td>
						</tr>
					  </tbody>
					</table>
				  </div>
				</div>
			<div className="mt-4 ">
										<div className="alert alert-info">
											<p className="mb-0 fs-xs"><span className="fw-semibold">NOTE:</span>
												<span id="note"><div dangerouslySetInnerHTML={{ __html: record.terms?record.terms:'N/A' }} />
												</span>
											</p>
										</div>
									</div>

			
			</div>
		  </div>
		   </div>
		  </div>
		 
		</div>
	  </div>`
	);
}


const date = {
    quotehtml,

};
module.exports = date;