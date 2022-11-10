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
    uid:Number,
    viewstatus:{
      type:String,
      enum:['seen', 'unseen', 'trash'],
      default:'unseen'
    }
	
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
