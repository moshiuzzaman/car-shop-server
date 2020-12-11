const express = require('express')
require('dotenv').config()
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const cors = require('cors');
const { ObjectId } = require('mongodb');
const port = 5000
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ki0s6.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('servics'));
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    
    const carCollection = client.db(`${process.env.DB_USER}`).collection("AllCars");



    app.post('/addCar', (req, res) => {
        const file = req.files.file
        const carName = req.body.carName
        const id = req.body.id
        const carDiscription = req.body.carDiscription
        const price = req.body.price
        const brandName = req.body.brandName
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
        };

        carCollection.insertOne({ id,carName, price, brandName ,carDiscription, image,rating:5 })
          .then(result => res.send(result.insertedCount > 0))
      })

      app.get('/allCars',(req,res)=>{
        carCollection.find()
          .toArray((err, result)=>res.send(result))
      })

      app.delete('/carDelete/:id',(req, res) => {
        const id=req.params.id 
        carCollection.deleteOne({id:id})
        .then(result => res.send(result.deletedCount>0))
  
    })
      app.patch('/editDetails/:id',(req, res) => {
          console.log('object');
        const id=req.params.id
        const carName = req.body.carName
        const carDiscription = req.body.carDiscription
        const price = req.body.price
       
        carCollection.updateOne({ id:id},
            { $set: { carName, price, carDiscription},
               })
               .then(result =>res.send(result.modifiedCount>0))
      })
      app.patch('/review/:id',(req, res) => {
          console.log(req.body);
        const id=req.params.id
        const comment = req.body.ratingAndComment.comment
        const rating = req.body.ratingAndComment.rating
       
        carCollection.updateOne({_id:ObjectId(id)},
            { $set: { comment, rating},
               })
               .then(result =>res.send(result.modifiedCount>0))
      })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT ||port, () => {
    console.log(`${port} is running`)
})