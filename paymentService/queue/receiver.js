const amqp = require('amqplib');

exports.recieveMessage = async (QUEUE) => {
    console.log("======== Recieving Message =======");
    return new Promise(async(resolve, reject) => {
        try{
            // Step 1: Create Connection
            // console.log("URL: ", process.env.MQ_URL);
            const connect = await amqp.connect(process.env.MQ_URL, "heartbeat=60");
            const channel = await connect.createChannel();

            await connect.createChannel();
            // Step 3: Assert Queue
            console.log({QUEUE})
            await channel.assertQueue(QUEUE, {durable: true});
            // Step 4: Receive Messages
            await channel.consume(QUEUE, (msg) => {
                console.log(`Message received: ${msg.content.toString()}`);
                resolve({err: null, msg: JSON.parse(msg.content.toString())});
                channel.ack(msg);
                channel.cancel('myconsumer');
            }, {consumerTag: 'myconsumer'});
            setTimeout( function()  {
                connect.close();
            }, 500 );
        }catch (err) {
            console.error(err);
            resolve({err, msg: null});
        }
    });
}