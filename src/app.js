const express = require("express");
const con = require("../src/config/database");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRoutes = require("./routes/request");
const userRoutes = require("./routes/user");
const app = express();

const PORT = 8989;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use("/", authRoutes)
app.use("/", profileRouter)
app.use("/", requestRoutes)
app.use("/", userRoutes)

// Establish DB Connection and Listen Server
con()
    .then(()=>{ 
        console.log("Connection Established Successfully.");
        app.listen(PORT, ()=>{console.log(`Server is listening at http://localhost:${PORT}`)})
    })
    .catch((error)=>console.log("Error in Connection DB.",error))