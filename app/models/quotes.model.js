module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		name: String,
		customer:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "customer"
		},
		pricing_level: String,
		site: String,
		quote_date: String,
		expiry_date: String,
		reference: String,
		doc_theme: String,
		description: String,
		terms:String,
		notes:Array,
		items: Array,
		status: {
			type: String,
			enum : ['Active','Inactive','Trash'],
			default: 'Active'
		}, 
		tax: {
			type: String,
			enum : ['Inclusive','Exclusive','No_tax'],
			default: 'Exclusive'
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
