const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI no está configurada');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

client.connect()
  .then(async () => {
    await client.db('casa_vieja').command({ ping: 1 });
    console.log('MongoDB heartbeat completado');
  })
  .catch((error) => {
    console.error('MongoDB heartbeat falló:', error.message);
    process.exitCode = 1;
  })
  .finally(() => client.close());