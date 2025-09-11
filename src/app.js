import express from 'express';
import cors from "cors";
import router from './routes/router.js';

const app = express();

// require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb", parameterLimit: 500 }));

app.use('/api',router)

// const swaggerSpec = swaggerJSDoc(options);
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
