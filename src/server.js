import express from "express";
import { PORT } from "./config/globalKey.js";
import router from "./routes/router.js";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json({ extended: true, limit: "500mb", parameterLimit: 500 }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb", parameterLimit: 500 }));

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
