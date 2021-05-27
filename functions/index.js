const functions = require("firebase-functions");
const square = require('./squareCLI.js');
const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

app.get('/test', async (req, res) => {
    let result = await square.getOrders("9408KRRF2VWN2", 18)
		for (const [key, value] of Object.entries(result)) {
      result[key] = (parseFloat(value) / 100.00).toFixed(2).toString()
    }
    
    res.send(result)
})

// Expose Express API as a single Cloud Function:
exports.test = functions.https.onRequest(app);

// async const app = functions.https.onRequest((req, res) => {
//     let result = await square.getOrders("9408KRRF2VWN2", 18)
// 		for (const [key, value] of Object.entries(result)) {
//       result[key] = (parseFloat(value) / 100.00).toFixed(2).toString()
//     }
    
//     res.send(result)
// })

// exports.test = functions.database.ref('/hello').onWrite(event => {
//     // set() returns a promise. We keep the function alive by returning it.
//     return event.data.ref.set('world!').then(() => {
//       console.log('Write succeeded!');
//     });
//   });

// exports.test = functions.https.onRequest(async (req, res) => {
//     let result = await square.getOrders("9408KRRF2VWN2", 18)
//         for (const [key, value] of Object.entries(result)) {
//     result[key] = (parseFloat(value) / 100.00).toFixed(2).toString()
//     }
    
//     res.send(result)
// })
