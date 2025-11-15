const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware

app.use(cors());
app.use(express.json())
const uri = "mongodb+srv://financedbUser:nvu22nxOZOmorlvV@cluster0.kf9k4pw.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res)=>{
    res.send('Finance server is running')
})


async function run (){
  try{
   await client.connect();
    

   const db = client.db('finance_db')
   const transactionCollection = db.collection('transactions');


   app.get('/transactions', async(req, res)=>{
    const cursor = transactionCollection.find();
    const result = await cursor.toArray();
    res.send(result)
   })

   app.get('/transactions/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await transactionCollection.findOne(query);
      res.send(result);
   })

   app.post('/transactions',async(req, res) => {
      const newTransaction = req.body;
      const result = await transactionCollection.insertOne(newTransaction);
      res.send(result);
   } )
   

   app.patch('/transactions/:id', async(req, res)=>{
    const id = req.params.id;
    const updatedTransaction = req.body;
    const query = { _id: new ObjectId(id)}
    const update = {
        $set: updatedTransaction
    }
   
    const result = await transactionCollection.updateOne(query, update)
    res.send(result)
   })

   app.delete('/transactions/:id', async(req, res) =>{
     const id = req.params.id;
     const query = { _id: new ObjectId(id)}
     const result = await transactionCollection.deleteOne(query);
     res.send(result)
   })

   await client.db("admin").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally{

  }
}
run().catch(console.dir)


app.listen(port, ()=>{
    console.log(`Finance server is running on port:${port}`)
})
