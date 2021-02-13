const amqp = require('amqplib');

exports.sendMessage = async (QUEUE, message) => {
    console.log("======== SEDNING Message =======");
    let isSend = false;
    try{
        // Step 1: Create Connection
        const connect = await amqp.connect(process.env.MQ_URL, "heartbeat=60");
        const channel = await connect.createChannel();

        await connect.createChannel();
        // Step 3: Assert Queue
        console.log({QUEUE})
        console.log({message})
        const isOk = await channel.assertQueue(QUEUE, {durable: true});
        // Step 4: Send Messages to QUEUE
        console.log({isOk});
        isSend = channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)));
        console.log(`Message send ${QUEUE}`);
        setTimeout( function()  {
            channel.close();
            connect.close();
        }, 500 );
        return isSend;
    }catch (err) {
        console.log(err);
        return isSend;
    }
}