const XeroClient = require('xero-node').XeroClient;
const db = require("../models");
const Paymentapi = db.accountingapis;
const Customer = db.customer; 
const Agent = db.agent;

const connect = async() =>{
	var set = await Paymentapi.findOne({ user: 'admin'});
	return new XeroClient({
	  clientId: set.loan_type === 'Live' ? set.live_clientid : set.sand_clientid,
	  clientSecret: set.loan_type === 'Live' ? set.live_clientsecret : set.sand_clientsecret,
	  grantType: 'client_credentials'
	}); 
}
 
const createContact = async(data, type) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const summarizeErrors = true;
	//console.log(data);
	if(type === 'agent'){
		data.firstname = '';
		data.lastname = '';
	}
	const contactss = {  
	  contacts: [{ 
		  name: type === 'agent' ? data.name : data.firstname+' '+data.lastname,
		  firstName: data.firstname,
		  lastName: data.lastname,
		  emailAddress: data.email,
		  phones: [{ phoneNumber: data.phone, phoneType: "MOBILE" }]
		}]
	}; 
	
	try {
	  const response = await xero.accountingApi.createContacts(xeroTenantId, contactss,  summarizeErrors);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.contacts[0].contactID;
	} catch (err) { 
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const updateContact = async(data, type) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const contactID = data.xero;
	const summarizeErrors = true;
	//console.log(data);
	if(type === 'agent'){
		data.firstname = '';
		data.lastname = '';
	}
	const contactss = { 
	  contacts: [{
		  contactID: data.xero,
		  name: type === 'agent' ? data.name : data.firstname+' '+data.lastname,
		  firstName: data.firstname,
		  lastName: data.lastname,
		  emailAddress: data.email,
		  phones: [{ phoneNumber: data.phone, phoneType: "MOBILE" }]
		}]
	}; 
	//console.log(contactss);
	try {
	  const response = await xero.accountingApi.updateContact(xeroTenantId, contactID, contactss);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.contacts[0].contactID;
	} catch (err) { 
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const createInvoice = async(data) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const summarizeErrors = true;
	const unitdp = 4;
	
	if(data.usertype === 'customer')
		var user = await Customer.findOne({_id: data.customer});
	else
		var user = await Agent.findOne({_id: data.agent});	

	const contact = {  
	  contactID: user.xero
	};  
	
	const lineItems = [];
	data.items.map((e, i)=>{
		var lineItem = { 
		  description: e.item,
		  quantity: e.qty,
		  unitAmount: e.price,
		  taxType: e.tax,
		  accountCode: "200"
		}; 
		lineItems.push(lineItem)
    });

	const invoice = { 
	  type: 'ACCREC',
	  contact: contact,
	  date: data.issuedate,
	  dueDate: data.duedate,
	  lineItems: lineItems,
	  reference: data.title,
	  lineAmountTypes: data.taxtype,
	  status: 'DRAFT'
	}; 

	const invoices = {  
	  invoices: [invoice]
	}; 

	try {
	  const response = await xero.accountingApi.createInvoices(xeroTenantId, invoices,  summarizeErrors, unitdp);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.invoices[0].invoiceID;
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const updateInvoice = async(data) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const summarizeErrors = true;
	const unitdp = 4;
	const invoiceID = data.xero;

	if(data.usertype === 'customer')
		var user = await Customer.findOne({_id: data.customer});
	else
		var user = await Agent.findOne({_id: data.agent});	

	const contact = {  
	  contactID: user.xero
	};   
	
	const lineItems = [];
	data.items.map((e, i)=>{
		var lineItem = { 
		  description: e.item,
		  quantity: e.qty,
		  unitAmount: e.price,
		  taxType: e.tax,
		  accountCode: "200"
		}; 
		lineItems.push(lineItem)
    });
	var status = data.status === 'Awaiting Payment' ? 'AUTHORISED' : 'DRAFT';
	const invoice = { 
	  type: 'ACCREC',
	  contact: contact,
	  date: data.issuedate,
	  dueDate: data.duedate,
	  lineItems: lineItems,
	  reference: data.title,
	  lineAmountTypes: data.taxtype,
	  status: status
	}; 

	const invoices = {  
	  invoices: [invoice]
	};
	
	try {
	  const response = await xero.accountingApi.updateInvoice(xeroTenantId, invoiceID, invoices,  unitdp);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.invoices[0].invoiceID;
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const getTaxes = async() => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const where = 'Status=="ACTIVE"';
	const order = 'Name ASC';
	const taxType = 'INPUT';

	try {
	  const response = await xero.accountingApi.getTaxRates(xeroTenantId,  where, order, taxType);
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.taxRates;
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const getAccounts = async() => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const ifModifiedSince = new Date("2020-02-06T12:17:43.202-08:00");
	const where = 'Status=="ACTIVE" AND Type=="BANK"';
	const order = 'Name ASC';

	try {
	  const response = await xero.accountingApi.getAccounts(xeroTenantId, ifModifiedSince, where, order);
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.accounts;
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	}
}

const getContact = async(contactID) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;

	try {
	  const response = await xero.accountingApi.getContact(xeroTenantId, contactID);
	  var res = JSON.parse(JSON.stringify(response.body));
	  //console.log(res);
	  return res.contacts[0];
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	}
}

const getInvoice = async(invoiceID) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	const unitdp = 4;

	try {
	   const response = await xero.accountingApi.getInvoice(xeroTenantId, invoiceID,  unitdp);
	  var res = JSON.parse(JSON.stringify(response.body));
	  //console.log(res);
	  return res.invoices[0];
	} catch (err) {
	  const error = JSON.stringify(err.response.body, null, 2)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	}
}

const addPayment = async(data) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;
	
	const invoice = { 
	  invoiceID: data.invoiceID
	}; 

	const account = { 
	  accountID: data.bank
	}; 

	const payment = { 
	  invoice: invoice,
	  account: account,
	  amount: data.amount,
	  date: new Date(data.date)
	}; 

	const payments = {  
	  payments: [payment]
	}; 
	
	try {
	  const response = await xero.accountingApi.createPayment(xeroTenantId, payment);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return {message: 'success', id: res.payments[0].paymentID};
	} catch (err) {
	  const error = JSON.parse(JSON.stringify(err.response.body, null, 2))
	  //console.log(error.Elements[0].ValidationErrors[0].Message)
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return {message: error.Elements[0].ValidationErrors[0].Message, id: ''};
	}
}

const removePayment = async(paymentID) => {
	const xero = await connect();
    const tokenSet = await xero.getClientCredentialsToken();
	await xero.updateTenants();
	const xeroTenantId = xero.tenants[0].tenantId;

	const paymentDelete = { 
	  status: "DELETED"
	}; 
	try {
	  const response = await xero.accountingApi.deletePayment(xeroTenantId, paymentID, paymentDelete);
	  //console.log(response.body || response.response.statusCode)
	  var res = JSON.parse(JSON.stringify(response.body));
	  return res.payments[0].paymentID;
	} catch (err) {
	  const error = JSON.parse(JSON.stringify(err.response.body, null, 2))
	  //console.log(`Status Code: ${err.response.statusCode} => ${error}`);
	  return 'error';
	}
}

const options = {
    createContact,
	updateContact,
	createInvoice,
	updateInvoice,
	getTaxes,
	getAccounts,
	getContact,
	getInvoice,
	addPayment,
	removePayment
};

module.exports = options;
