const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) =>{
    res.send('Server Running')
})


const uri = "mongodb+srv://mdashik:mongopass@cluster0.bgcjjxf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
  const emajohndb = client.db("emajohndb")
  console.log('mongodb connected')

  app.post('/addproduct',(req,res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      const config = {
        cloud_name: "dhdsakdbn",
        api_key: '696353722392268',
        api_secret: '-G95X5cg0BZ0n85OpVbw-85TOxo',
        secure: true
      }
      try {
        const {url} = await cloudinary.uploader.upload(files.productImage.filepath,config);
        if (url) {
          const key = Math.floor(Math.random() * 4238834532354834);
            fields.key = `${key}`;
            fields.img = url;
            console.log(fields)
            emajohndb.collection('products').insertOne(fields)
            .then(res => {
              console.log('Product upload successfully')
            })
        }
      } catch (err) {
        console.log(err)
      }
      res.json({ fields, files });
    });
  })

  app.get('/products',(req,res) => {
    emajohndb.collection('products').find({}).toArray((err, products) =>{
        res.send(products)
    })
  })

  app.post('/productkeys',(req,res) => {
    emajohndb.collection('products').find({key : {$in : req.body}})
    .toArray((err, products) =>{
        res.send(products)
    })
  })

  app.get('/singleproduct/:key',(req,res) => {
    emajohndb.collection('products').find({key : req.params.key}).toArray((err,product) => {
      if (err) {
        res.send(err)
      }else{
        res.send(product)
      }
    })
  })

  app.post('/order',(req,res) => {
    const products = req.body
    emajohndb.collection('orderProducts').insertOne({products})
    .then(insrtres => {
      console.log(insrtres)
      res.send(insrtres);
    })
    .catch(err => {
      console.log(err)
    })

  })

  app.get('/orderedproducts/:userId',(req,res) => {
    const userId = `${req.params.userId}`;
    emajohndb.collection('orderProducts').find({products: {$elemMatch : {userid : userId}}})
    .toArray((err,products) => {
       if(err){
        console.log(err)
       }else{
        res.send(products)
       }
    })
  })




});




app.listen(3001,() =>{
    console.log('Server listening on port 3001');
})

