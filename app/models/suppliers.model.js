module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      suppliername:String,
      contactname:String,
      password: String,
      email: String,
      phone: String,
      mobile:String,
      fax:String,
      address : String,
      address1 : String,
      photo: String,
      doc_theme:String,
      tax:String,
      invoice_due_type:String,
      invoice_due_date:Number,
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

  const Suppliers = mongoose.model("suppliers", schema);
  return Suppliers;
};
