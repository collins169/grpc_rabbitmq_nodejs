const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerId: Number,
    productId: Number,
    orderId: String,
    status: String
});

module.exports = mongoose.model("Payment", paymentSchema);