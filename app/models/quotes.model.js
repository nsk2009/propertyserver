module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		name: String,
		customer:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "customer"
		},
		agent:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "agent"
		},
		tenant:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tenant"
		},
		enquiry:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "enquiry"
		},
		pricing_level: String,
		site: String,
		quote_date: String,
		expiry_date: String,
		reference: String,
		doc_theme: String,
		description: String,
		subtotal: String,
		grosstotal: String,
		discamt: String,
		taxamt: String,
		total: String,
		discount: String,
		distype: String,
		taxrate: String,
		taxtype: String,
		taxid:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "taxes"
		},
		taxname: String,
		tax: String,
		terms:String,
		history:Array,
		notes:Array,
		uid:String,
		items: Array,
		senttocustomer: {
			type: Number,
			enum : [0, 1],
			default: 0
		}, 
		movedtojob: {
			type: Number,
			enum : [0, 1],
			default: 0
		}, 
		tradie:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
		},
		usertype: {
			type: String,
			enum : ['customer','agent'],
			default: 'customer'
		}, 
		status: {
			type: String,
			enum : ['Draft','Revise','Approved','Declined', 'Pending', 'Moved to Job','Awaiting Client Approval'],
			default: 'Draft'
		}, 
		tstatus: {
			type: String,
			enum : ['Draft','Revise','Approved','Declined', 'Sent to Admin','Awaiting Client Approval'],
			default: 'Draft'
		}, 
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
		modifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
    },
	{ timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Model = mongoose.model("quotes", schema);
  return Model;
};
