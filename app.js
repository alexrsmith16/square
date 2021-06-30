const express = require('express')
// import express from 'express'
const app = express()
const port = process.env.PORT || 8080

const square = require('./squareCLI.js')
// import square from './squareCLI.js'

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/test', async (req, res) => {
	let result = await square.getOrders("9408KRRF2VWN2", 18)
	for (const [key, value] of Object.entries(result)) {
		result[key] = (parseFloat(value) / 100.00).toFixed(2).toString()
	}
	
	res.send(result)
})

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
})