const mongoose = require('mongoose');

const db = process.env.DATABASE; 

mongoose.connect(db, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}). then (() => {
    console.log("CONNECTION HAS BEEN SUCCESSFUL");
}). catch((error) => {
    console.log(error);
})