const express = require('express')
// import express from 'express'
const app = express()
const port = process.env.PORT || 8080

const square = require('./squareCLI.js')
// import square from './squareCLI.js'

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('public')
})

app.get('/test', async (req, res) => {
	console.log(req.query)
	console.log(typeof req.query)
	console.log(req.params)
	// let requestBody = JSON.parse(req.params)
	// console.log(requestBody)
	let result = await square.getOrders("9408KRRF2VWN2", req.query.from, req.query.to)
	if (typeof result ===  "object") {
		for (const [key, value] of Object.entries(result)) {
			result[key] = (parseFloat(value) / 100.00).toFixed(2).toString()
		}
	}
	
	res.send(result)
})

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
})