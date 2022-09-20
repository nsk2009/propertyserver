module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      script: String,
      status: String
    }
  );

  schema.plugin(mongoosePaginate);

  const Dateformat = mongoose.model("dateformates", schema);
  return Dateformat;
};
