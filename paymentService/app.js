require("dotenv").config();
const mongoose = require('mongoose');
const Order = require('./model/order');
const Payment = require('./model/payment');
const {recieveMessage} = require('./queue/receiver');
const {sendMessage} = require('./queue/sender');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@grpc1.7hcbv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
 {useNewUrlParser: true, useUnifiedTopology: true }
 );

var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});


const processPayment = async () => {
    const queueResponse = await recieveMessage(process.env.REQUEST_QUEUE);
    console.log({queueResponse});
    if(queueResponse.err){
        throw new Error(queueResponse.err);
    }

    if(queueResponse.msg){
        const id = queueResponse.msg.orderId;
        const order = await Order.findOne({_id: id}).exec();
        if(order){
            const newPayment = new Payment({
                _id: new mongoose.Types.ObjectId(),
                customerId: order.customerId,
                productId: order.productId,
                orderId: id,
                status: 'complete'
            });
            await newPayment.save();
            console.log({newPayment});
            if(newPayment){
                const updateOrder = await Order.updateOne({_id: id}, {$set: {orderStatus: "fulfill"}});
                console.log({updateOrder});
            }
        }
    }
}
setInterval(function(){
processPayment();
}, 3000);
