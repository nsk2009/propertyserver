module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
	  data: [],
	  file: String,
	  count: String,
	  start: Number,
	  end: Number,
	  limit: Number,
      type: {
        type : String,
        enum : ['provider', 'lead', 'customer'],
        default : 'lead'
      },
      imported: {
        type : String,
        enum : ['no', 'yes'],
        default : 'no'
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminuser"
      },
      status: {
        type: String,
        enum : ['Active','Imported'],
        default: 'Active'
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

  const Imports = mongoose.model("imports", schema);
  return Imports;
};
