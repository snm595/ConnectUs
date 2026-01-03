const mongoose = require('mongoose');
const Community = require('../models/Community');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const communities = await Community.find({});
    console.log(communities);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
