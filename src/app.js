import express, { json } from 'express';
const app = express();
app.use(cors());
app.use(json());
// require('dotenv').config();
import cors from "cors";
import router from './routes/router.js';

// const swaggerSpec = swaggerJSDoc(options);
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api',router)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
