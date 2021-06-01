var express = require('express')
var bodyparser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')


app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

//this is to use default promise from ES library not from mongoose
mongoose.Promise = Promise

var dbUrl = 'mongodb+srv://nodeuser:nodepassword@nodecluster.cufuc.mongodb.net/NodeCluster?retryWrites=true&w=majority'


var Message = mongoose.model('MessagesStore', {
    name: String,
    message: String
})

/* var messages = [
    {name: 'Tim', message: 'Hi'},
    {name: 'Bin', message: 'Hello!'}
] */

app.get('/messages', (req, res) => {

    Message.find({}, (err, messages) => {
        res.send(messages)

    })
    //res.send('hello')
    //res.send(messages)
})

app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({name: user}, (err, messages) => {
        res.send(messages)

    })
})

app.post('/messages', async (req, res) => {

    try {

        var message = new Message(req.body)
        //multiple callback will be very complexed and we also called callback hell/nested callback 
        //so now we use promise (it gives another option how to work with async code) it return an object which promise to do somework. This object has separate 
        // callback for success and failure.. this lets us work asyn code in much sunchronous way

        //async/await  is one of the latest features at node, similar to promises , it makes asyncho code look even more synchronous
        //we need declare express func as async

        var savedMessage = await message.save()

        console.log('saved')

        var censored = await Message.findOne({ message: 'badword' })


        if (censored)
            //console.log('censored word found ', censored)
            await Message.remove({ _id: censored.id })

        else
            //console.log(req.body)
            io.emit('message', req.body)


        res.sendStatus(200)
        
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    }

    
    
        /* .catch((err) => {
            res.sendStatus(500)
            return console.error(err)
        }) */

    //console.log("post message with req body", req.body)
})


io.on('connection', (socket) => {

    console.log('user connected')
})

mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) => {

    console.log('MongoDB connection', err)
})

var server = http.listen(3000, () => {

    console.log("This server is listening on port ", server.address().port)
})