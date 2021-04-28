const express = require('express');
const multer = require('multer');
const taskRouter = require('./routes/task');
const userRouter = require('./routes/user');
const port = process.env.PORT || 3000;

require('./mongoose-db');
const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`app started successfully at port ${port}`);
});

