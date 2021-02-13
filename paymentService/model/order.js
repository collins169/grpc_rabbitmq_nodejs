const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerId: Number,
    productId: Number,
    orderStatus: String
});

module.exports = mongoose.model("Order", orderSchema);