const mongoose = require("mongoose")

const con = async()=>{
    await mongoose.connect("mongodb+srv://namasteDev:VcpEUEhoPgEhaP4M@namaste-node.i1pdm.mongodb.net/devTinder")
}

module.exports = con;