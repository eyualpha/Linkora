const { PORT } = require("./configs/env.config.js");
const connectDB = require("./configs/mongodb.config.js");
const app = require("./app");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
