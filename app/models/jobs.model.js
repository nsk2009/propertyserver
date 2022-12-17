module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		title: String,
		address: String,
		startdate: String,
		duedate: String,
		enquiry:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "enquiry"
		},
		quote:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quotes"
		},
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
		tradie:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
		},		
        contact: Array,
		pricing_level: String,
		site: String,
		reference: String,
		doc_theme: String,
		description: String,
		uid:String,
		terms:String,
		contact: Array,
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
		items: Array,
		invoice: {
			type: Number,
			default: 0
		},
		usertype: {
			type: String,
			enum : ['customer','agent'],
			default: 'customer'
		}, 
		status: {
			type: String,
			enum : ['New','In Progress','To Invoice','Complete'],
			default: 'New'
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

  const Model = mongoose.model("jobs", schema);
  return Model;
};
