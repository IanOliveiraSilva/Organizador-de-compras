const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/addItem', async (req, res) => {
  try {
    const { name, value, link, room, priority, purchased } = req.body;
    await db.collection('items').add({ name, value, link, room, priority, purchased });
    res.status(200).send('Item added successfully');
  } catch (error) {
    res.status(500).send('Error adding item');
  }
});

app.post('/removeItem', async (req, res) => {
  try {
    const { id } = req.body;
    await db.collection('items').doc(id).delete();
    res.status(200).send('Item removed successfully');
  } catch (error) {
    res.status(500).send('Error removing item');
  }
});

app.post('/togglePurchased', async (req, res) => {
    try {
      const { id, purchased } = req.body;
      await db.collection('items').doc(id).update({ purchased });
      res.status(200).send('Item updated successfully');
    } catch (error) {
      res.status(500).send('Error updating item');
    }
  });
  

app.get('/getItems', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).send('Error fetching items');
  }
});

app.post('/updateItem', async (req, res) => {
    try {
      const { id, name, value, link, room, priority } = req.body;
      await db.collection('items').doc(id).update({ name, value, link, room, priority });
      res.status(200).send('Item updated successfully');
    } catch (error) {
      res.status(500).send('Error updating item');
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
