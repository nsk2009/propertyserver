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
		reference: String,
		doc_theme: String,
		description: String,
		terms:String,
		cate1:String,
		cate2:String,
		jobcontact:String,
		jobphone:String,
		jobmobile:String,
		sitecontact:String,
		sitephone:String,
		sitemobile:String,
		custom1:String,
		custom2:String,
		custom3:String,
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

  const Model = mongoose.model("jobs", schema);
  return Model;
};
