module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name:String,
      email: String,
      phone: String,
      address : String,
      description : String,
      photo: String,
      status: {
        type: String,
        enum: ['Active', 'Inactive', 'Trash'],
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

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Providers = mongoose.model("enquiry", schema);
  return Providers;
};
