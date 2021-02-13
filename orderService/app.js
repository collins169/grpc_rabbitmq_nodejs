require("dotenv").config();
let PROTO_PATH = __dirname + '/pb/messages.proto';
let grpc = require('grpc');
let protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Order = require('./model/order');
const {recieveMessage} = require('./queue/receiver');
const {sendMessage} = require('./queue/sender');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@grpc1.7hcbv.mongodb.net/${process.env.GRPC1}?retryWrites=true&w=majority`,
 {useNewUrlParser: true, useUnifiedTopology: true }
 );

var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

let OrderProto = grpc.loadPackageDefinition(packageDefinition).order;
// console.log(PROTO_PATH)
const orderProduct = async (call, callback) => {
    try{
        console.log(call.request);
        const request = call.request.orderRequest;
        let order = new Order({
            _id: new mongoose.Types.ObjectId(),
            customerId: request.customerId,
            productId: request.productId,
            orderStatus: 'pending'
        })
        const newOrder = await order.save();
        console.log(newOrder);
            const response = {
                orderId: newOrder.id,
                customerId: newOrder.customerId,
                productId: newOrder.productId,
                orderStatus: newOrder.orderStatus
            }
            console.log(response);
            callback(null, {orderResponse: response});
            const isSuccess = await sendMessage(process.env.REQUEST_QUEUE, response);
            console.log({isSuccess});
    }catch(err){
        callback(err, {orderResponse: ''});
    }
}

const findOrderById = async (call, callback) => {
    try{
        console.log(call.request);
        const request = call.request;
        let order = await Order.findOne({_id: request.id}).exec();
        console.log(order);
            const response = {
                orderId: order.id,
                customerId: order.customerId,
                productId: order.productId,
                orderStatus: order.orderStatus
            }
            // console.log(response);
            callback(null, {orderResponse: response});
    }catch(err){
        callback(err, {orderResponse: ''});
    }
}

const findAllOrder = async (call, callback) => {
    try{
        console.log("===== findAllOrder =====")
        let order = await Order.find({}).exec();
        console.log(order);
        order = order.map(data => {
            return {
                orderId: data.id,
                customerId: data.customerId,
                productId: data.productId,
                orderStatus: data.orderStatus
            }
        })
            console.log(order);
            callback(null, {orderResponse: order});
    }catch(err){
        callback(err, {orderResponse: ''});
    }
}

console.log("======= STARTING GRPC SERVER ==========");
var server = new grpc.Server();
server.addService(OrderProto.OrderService.service, {
    orderProduct: orderProduct, 
    findOrderById: findOrderById,
    findAllOrder: findAllOrder
});
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
console.log("======= STARTED GRPC SERVER ==========");
