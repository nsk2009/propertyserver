module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      content : String,
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
      },
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "agent"
      },
      enquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "enquiry"
      },
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs"
      },
      quote: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quotes"
      },
		invoice:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "invoices"
		},
      tradie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tradie"
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminuser"
      },
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminuser"
      },
      status: {
        type: String,
        enum: ['Active', 'Inactive', 'Trash'],
        default: 'Active'
      },
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Notes = mongoose.model("note", schema);
  return Notes;
};
