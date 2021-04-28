const mongoose = require('mongoose');

const url = process.env.MONGO_CONNECTION_URL;
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});
