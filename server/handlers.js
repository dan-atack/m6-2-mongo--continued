'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

const getSeats = async (req, res) => {
  const client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log('so far so good.');
    const db = client.db('seats');
    // put the data in an array when it comes out, then check if we got it:
    await db
      .collection('seats')
      .find()
      .toArray((err, result) => {
        if (result != null) {
          console.log('again', result);
          let seats = {};
          result.forEach((seat) => {
            seats[`${seat._id}`] = seat;
          });
          console.log(seats);
          return res.status(200).json({
            status: 200,
            seats: seats,
            numOfRows: 8,
            seatsPerRow: 12,
          });
        } else {
          console.log('we tried our best but we got NOTHING!!');
          return res.status(404).json({
            status: 404,
            error: err,
            message: 'Ugh, sorry boss mang.',
          });
        }
      });
  } catch {
    console.log('Uhh, Mister Atack? It happened again...');
  }
};

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration, fullName, email } = req.body;
  // ensure the credit card info is there before proceeding:
  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: 'Please provide credit card information!',
    });
  }
  // verify seat ID format is correct, and create newValue to insert in DB (changing seat's isBooked status to true)
  const query = { _id: seatId }; // query must be an object with key `_id` and the value of that id
  console.log(query);
  const newValue = {
    $set: { isBooked: true, email: email, fullName: fullName },
  };
  // proceed to verify seat id number, then send that to the DB to update the info for that seat:
  const client = new MongoClient('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log('database update beginning...');
    const db = client.db('seats');
    const r = await db.collection('seats').updateOne(query, newValue);
    assert.equal(1, r.matchedCount);
    assert.equal(1, r.modifiedCount);
    client.close();
    return res.status(202).json({ status: 202, success: true });
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = { getSeats, bookSeat };
