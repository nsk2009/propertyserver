module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name: String,
      subject: String,
      from: String,
      to: String,
	  reply: String,
      content: String,
      params: String,
      template: String,
      template_id:String,
	  createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
	  modifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
      type: {
        type: String,
        enum : ['Notification','Template'],
        default: 'Notification'
        },
        notification_type: {
          type: String,
          enum : ['Customer','Inhouse']
          },
      status: {
        type: String,
        enum : ['Active','Inactive','Trash'],
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

  const Emailnotification = mongoose.model("emailnotifications", schema);
  return Emailnotification;
};
