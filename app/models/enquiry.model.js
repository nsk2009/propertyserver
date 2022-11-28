module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      title:String,
      name:String,
      company:String, 
      email: String,
      uid:String,
      phone: String,
      source: String,
      others: String,
      address : String,
      tradie : Array,
      responsed_tradies : Array,
      rfq_description:String,
      tradie_label : Array,
      history:Array,
      lat: String,
      lng: String,
      jobaddress : String,
      joblat: String,
      joblng: String,
      description : String,
      movedtoquote : {
        type:Number,
        enum:[0, 1],
        default:0
      },
      customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
      },
		agent:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "agent"
		},
		tenant:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tenant"
		},
      quote: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
      },
      sameaddress: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
      },
		usertype: {
			type: String,
			enum : ['customer','agent'],
			default: 'customer'
		}, 
      photo: String,
      status: {
        type: String,
		enum : ['New','Quote Requested','Moved to Quote', 'Moved to Job'],
		default: 'New'
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
