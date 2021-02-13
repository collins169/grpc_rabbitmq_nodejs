const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, index: true, require: true},
    phone: { type: String, index: true, require: true, unique: true},
    email: { type: String, index: true, require: true, unique: true}
});

module.exports = mongoose.model("Customer", customerSchema);