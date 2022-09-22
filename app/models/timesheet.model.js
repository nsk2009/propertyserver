module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      date:String,
      starttime: String,
      endtime: String,
      job : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs"
      },
      billingrate : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "billingrates"
      },
      notes : String,
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

  const Timesheet = mongoose.model("timesheet", schema);
  return Timesheet;
};
