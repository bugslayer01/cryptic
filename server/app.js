import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoSanitize from "express-mongo-sanitize";
import methodOverride from 'method-override'
import helmet from "helmet";
import authRoute from './src/routes/auth.js'
import mainRoute from './src/routes/main.js'
import adminRoute from './src/routes/admin.js'
import crypticRoute from './src/routes/cryptic.js'
import connectMongo from "./src/db/mongoose.js";
// import requestLogger from "./src/middlewares/requestLogger.js";

// Configure environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Redirect to www
app.use((req, res, next) => {
  if (req.hostname === 'mystixia.live') {
    return res.redirect(301, `https://www.${req.hostname}${req.url}`);
  }
  next();
});

// MongoDB connection
connectMongo();

// Middleware setup
// app.use(requestLogger)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(methodOverride("_method"));
app.use(mongoSanitize());
app.disable('x-powered-by');
//helmet
app.use(helmet.xssFilter()); 
app.use(helmet.noSniff()); 
app.use(helmet.ieNoOpen());
app.use(helmet.hsts());
app.use(helmet.referrerPolicy());
app.use(helmet.frameguard({ action: 'deny' }));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../public/views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use(authRoute);
app.use(mainRoute);
app.use(crypticRoute)
app.use(adminRoute)

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).render("404", { url: req.originalUrl });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
