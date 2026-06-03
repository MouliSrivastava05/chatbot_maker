import { MongoClient } from 'mongodb';

async function run() {
  const uri = "mongodb+srv://moulisrivastava5_db_user:Mouliattherate607@cluster0.qdjewrt.mongodb.net/chatbotmaker?appName=Cluster0";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('chatbotmaker');
    const users = await db.collection('users').find({}).toArray();
    console.log(JSON.stringify(users, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

