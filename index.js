const express = require("express");
const app = express();
var cors = require('cors')

const connectDb = require("../backend/db/db")
const {PORT} = require("./config/config");

connectDb ()

const mainRouter =require("./routes/index")

app.use(cors())
// Middleware for parsing JSON data
app.use(express.json());


app.use("/api/v1",mainRouter)

app.listen(PORT,()=>{
    console.log("Backend is connected to the port number",PORT)
})