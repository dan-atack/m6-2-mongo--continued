const { MongoClient } = require('mongodb');
const assert = require('assert');

// Generate proper seats now:
let seats = [];
const row = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats.push({
      // add _id to each seat:
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    });
  }
}

const batchImport = async (dbName, collection) => {
  const seatData = seats;
  // create one test seat and then see if we can find it with insomnia
  const client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });
  // initiate connection within try/catch braces:
  try {
    await client.connect();
    console.log('connexion established.');
    // establish database (which in this case will be a new one, as in the very first exercise with Buck Rogers.)
    const db = client.db(dbName);
    // r is for record, and it must await the change that we'll make to the db, in a new collection:
    const r = await db.collection(collection).insertMany(seatData);
    assert.equal(seats.length, r.insertedCount);
    console.log('success!?');
    client.close();
    console.log('drop mic on stage.');
  } catch {
    console.log('uhh Mister Atack? It happened again...');
  }
};

batchImport('seats', 'seats');
