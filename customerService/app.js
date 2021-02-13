require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let PROTO_PATH = __dirname + '/pb/messages.proto';
let grpc = require('grpc');
let protoLoader = require('@grpc/proto-loader');
let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

let OrderProto = grpc.loadPackageDefinition(packageDefinition).order;

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@grpc1.7hcbv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
 {useNewUrlParser: true, useUnifiedTopology: true }
 );

var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
  console.log("Connection Successful!");
});


var client = new OrderProto.OrderService('localhost:50051', grpc.credentials.createInsecure());
app.post('/order', async(req, res) => {
    const payload = {
        customerId: req.body.customerId,
        productId: req.body.productId,
    }
    console.log(payload);
    client.orderProduct({orderRequest: payload}, function(err, response) {
        console.log("=========")
        console.log(response);
        if(err){
            return res.status(500).json({
                success: false,
                message: err,
                data:[]
            })
        }
        return res.status(200).json({
            success: true,
            message: "Order is being processed",
            data: response.orderResponse
        });
      });
});

app.get('/order/:id', async (req, res) => {
    const {id} = req.params;

    client.findOrderById({id: id}, function (err, response) {
        console.log({response});
        if(err){
            return res.status(500).json({
                success: false,
                message: err,
                data:[]
            })
        }
        return res.status(200).json({
            success: true,
            message: "SUCCESS",
            data: response.orderResponse
        });
    });
});

app.get('/order', async (req, res) => {
    client.findAllOrder({id: ''}, function (err, response) {
        console.log({response});
        if(err){
            return res.status(500).json({
                success: false,
                message: err,
                data:[]
            })
        }
        return res.status(200).json({
            success: true,
            message: "SUCCESS",
            data: response.orderResponse
        });
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
