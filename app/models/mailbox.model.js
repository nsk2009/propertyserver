module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      email:String,
      password:String,
      host:String,
      port:String,
	  mail: Number,
      mail: {
        type: Number,
        default: 1
      },
      default: {
        type: Number,
        enum: [0, 1],
        default: 0
      },
      tls: {
        type: String,
        enum: ['yes', 'no'],
        default: 'yes'
      },
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

  const Table = mongoose.model("mailboxes", schema);
  return Table;
};
