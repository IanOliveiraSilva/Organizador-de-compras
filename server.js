require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

// Configuração do Firebase Admin SDK com as variáveis de ambiente
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain:process.env.UNIVERSE_DOMAIN
  })
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
      console.error('Error adding item:', error);
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
    console.error('Error getting item:', error);
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
