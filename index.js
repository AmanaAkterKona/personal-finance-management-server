const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//middleware

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kf9k4pw.mongodb.net/?appName=Cluster0`;
  

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Finance server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("finance_db");
    const transactionCollection = db.collection("transactions");
    const usersCollection = db.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user already exist.do not need to insert again" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/transactions", async (req, res) => {
      const projectFields = {
        type: 1,
        category: 1,
        amount: 1,
        description: 1,
        date: 1,
        email: 1,
        name: 1,
      };
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = transactionCollection.find(query);
      const data = await cursor.toArray();
      const sorted = data.sort((a, b) => Number(b.amount) - Number(a.amount));
      res.send(sorted);
    });





   app.get("/transactions", async (req, res) => {
  const email = req.query.email;
  const sort = req.query.sort; // <-- frontend theke pathano sort type

   const query = {};
  if (email) query.email = email;

  // MongoDB backend sorting
  const result = await transactionCollection
    .find(query)
    .sort(sortQuery)
    .toArray();

  res.send(result);
});





    app.get("/transactions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await transactionCollection.findOne(query);
      res.send(result);
    });

    app.post("/transactions", async (req, res) => {
      const newTransaction = req.body;
      const result = await transactionCollection.insertOne(newTransaction);
      res.send(result);
    });

    app.get("/transactions/category-total/:category", async (req, res) => {
      const category = req.params.category;
      const email = req.query.email;

      const query = { category, email };

      const transactions = await transactionCollection.find(query).toArray();

      const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

      res.send({ total });
    });

    app.delete("/transactions/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid transaction ID" });
      }

      const query = { _id: new ObjectId(id) };
      const result = await transactionCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Transaction not found" });
      }

      res.send({ message: "Transaction deleted successfully", result });
    });


    

    app.patch("/transactions/:id", async (req, res) => {
      const id = req.params.id;

      // Validate ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid transaction ID" });
      }

      const updatedTransaction = req.body;
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          type: updatedTransaction.type,
          category: updatedTransaction.category,
          amount: Number(updatedTransaction.amount),
          description: updatedTransaction.description,
          date: new Date(updatedTransaction.date),
        },
      };

      const result = await transactionCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Overview: total balance, total income, total expenses
    app.get("/overview", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: "Email দিতে হবে" });
      }

      const transactions = await transactionCollection
        .find({ email })
        .toArray();

      let income = 0;
      let expenses = 0;

      transactions.forEach((t) => {
        if (t.type === "income") {
          income += Number(t.amount);
        } else if (t.type === "expense") {
          expenses += Number(t.amount);
        }
      });

      const totalBalance = income - expenses;

      res.send({
        totalBalance,
        income,
        expenses,
      });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Finance server is running on port:${port}`);
});
