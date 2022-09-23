module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      content : String,
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
      },
      type : String,
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
