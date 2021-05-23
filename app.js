import { bigint } from '@apimatic/schema'
import { ApiError, Client, Environment } from 'square'

const client = new Client({
	environment: Environment.Production,
	accessToken: "EAAAEcuZOKe6J830nfnE8vcAi8WKKjaUgQNTC3TZqdNhgcVlTCCEL22S0vf2A8r0",
})

// Get an instance of the Square API you want call
const { locationsApi } = client

let today = new Date();
let lastWeek = new Date();
lastWeek.setDate(today.getDate() - 1)

async function getOrders() {
	console.log(`startAt: ${lastWeek.toISOString()}, endAt: ${today.toISOString()}`)
	
	try {
		const response = await client.ordersApi.searchOrders({
			locationIds: [
				'9408KRRF2VWN2',
				'3PHRKCNFYTXR0'
			],
			query: {
				filter: {
					dateTimeFilter: {
						createdAt: {
							startAt: "2021-05-22T08:00:00.000-07:00",
							endAt: "2021-05-23T08:00:00.000-07:00"
						}
					}
				},
				sort: {
					sortField: 'CREATED_AT',
					sortOrder: 'ASC'
				}
			},
			limit: 500
		});
	
		let orders = response.result.orders;
		console.log("count: " + orders.length);

		let total = BigInt(0);
		let allTips = BigInt(0);
		orders.forEach((it, index) => {
			if (it.totalMoney == undefined) {
				console.log(index);
				return;
			}

			let orderTotal = it.totalMoney.amount;
			
			if (typeof orderTotal != "bigint") {
				orderTotal = BigInt(orderTotal);
			}

			let totalTip
			if (it.totalTip != undefined) {
				totalTip = BigInt(it.totalTip.amount);
			}

			total += orderTotal;
		});

		console.log("total: " + total);
	} 
	catch(error) {
		console.log(error);
	}
}

// Invokes the async function
// getOrders()

async function getPayments() {
	try {
		const response = await client.paymentsApi.listPayments(
		lastWeek.toISOString(),
		today.toISOString(),
		'ASC', "",
		'9408KRRF2VWN2');
		let payments = response.result.payments
		console.log(payments.length);

		let total = BigInt(0);
		let issues = [];
		payments.forEach((it, index) => {
			if (it.amount_money == undefined) {
				issues.push(index);
				return;
			}

			let orderTotal = it.amount_money.amount;
			if (typeof orderTotal != "bigint") {
				orderTotal = BigInt(orderTotal);
			}
			total += orderTotal;

		})

		console.log(total);
	}
	catch(error) {
		console.log(error);
	}
}

async function testPayments() {
	try {
		const response = await client.paymentsApi.listPayments('2021-05-16T21:07:49.069Z',
		'2021-05-23T21:07:49.069Z',
		'ASC',
		'9408KRRF2VWN2',
		500);
	
		console.log(response.result);
	} catch(error) {
		console.log(error);
	}
}

getOrders();