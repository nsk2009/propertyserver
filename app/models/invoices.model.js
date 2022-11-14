module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		quote:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quotes"
		},
		customer:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "customer"
		},
		tradie:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
		},
		job:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "jobs"
		},
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
		expiry_date: String,
		terms: String,
		taxid:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "taxes"
		},
		taxname: String,
		tax: String,
		items: Array,
		description: String,
		status: {
			type: String,
			enum : ['Active','Inactive','Trash'],
			default: 'Active'
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

  const Model = mongoose.model("invoices", schema);
  return Model;
};
