module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		email: String,
		from: String,
		date: Date,
		subject: String,
		html: String,
		text:String,
		to: String,
		attachment: Array,
		uid:Number,
		viewstatus:{
		  type:String,
		  enum:['seen', 'unseen', 'trash'],
		  default:'unseen'
		},
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs"
      },
      customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
      },
		agent:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "agent"
		},
		tradie:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
		},
		enquiry:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "enquiry"
		},
		quote:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quotes"
		},
		invoice:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "invoices"
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

  const Model = mongoose.model("inbox", schema);
  return Model;
};
