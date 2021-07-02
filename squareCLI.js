// import { ApiError, Client, Environment } from 'square'
const { ApiError, Client, Environment } = require('square')

const client = new Client({
	environment: Environment.Production,
	accessToken: "EAAAEcuZOKe6J830nfnE8vcAi8WKKjaUgQNTC3TZqdNhgcVlTCCEL22S0vf2A8r0",
})

// Get an instance of the Square API you want call
const { locationsApi } = client

let today = new Date();
let lastWeek = new Date();
lastWeek.setDate(today.getDate() - 1)

async function getOrders(locationID, startDay, endDay) {
	try {
		const response = await client.ordersApi.searchOrders({
			locationIds: [
				locationID
			],
			query: {
				filter: {
					// fulfillmentFilter: {
					//   fulfillmentStates: [
					// 	'COMPLETED'
					//   ]
					// },
					stateFilter: {
					  states: [
						'COMPLETED'
					  ]
					},
					dateTimeFilter: {
						createdAt: {
							startAt: startDay + "T00:00:00.000-07:00",
							endAt: endDay + "T23:59:00.000-07:00"
						}
					}
				},
				sort: {
					sortField: 'CREATED_AT',
					sortOrder: 'ASC'
				}
			},
			limit: 1000
		});
	
		if (response.result.orders == undefined || response.result.orders == null) {
			return "No data found for date range selected";
		}
		let orders = response.result.orders;

		let total = BigInt(0);
		let allDiscount = BigInt(0);
		let allService = BigInt(0);
		let allTax = BigInt(0);
		let allTips = BigInt(0);

		let allNetAmmounts = {
			discountMoney: BigInt(0),
			serviceChargeMoney: BigInt(0),
			taxMoney: BigInt(0),
			tipMoney: BigInt(0),
			totalMoney: BigInt(0)
		}

		let allGrossSales = BigInt(0);
		let allRefunds = BigInt(0);
		let allReturns = {
			discountMoney: BigInt(0),
			serviceChargeMoney: BigInt(0),
			taxMoney: BigInt(0),
			tipMoney: BigInt(0),
			totalMoney: BigInt(0)
		}
		let allDiscounts = BigInt(0);
		console.log("COUNT" + orders.length);
		orders.forEach((it, index) => {
			if (it.netAmounts != undefined && it.returnAmounts != undefined) {
				// let total = BigInt(0);
				// it.returns.forEach(item => total += BigInt(item.totalMoney.amount));
				for (const [key, value] of Object.entries(it.returnAmounts)) {
					allReturns[key] += BigInt(value.amount);
				}
			}

			if (it.netAmounts == undefined && it.refunds != undefined) {
				let total = BigInt(0);
				it.refunds.forEach(item => total += BigInt(item.amountMoney.amount));
				allRefunds += total;
			}

			if (it.discounts != undefined) {
				let total = BigInt(0);
				it.discounts.forEach(item => {
					if (item.amountMoney == undefined) {
						console.log("discount weird: " + it.id);
					}
					total += BigInt(item.appliedMoney.amount)}
				);
				allDiscounts += total;
			}

			if (it.lineItems != undefined) {
				let total = BigInt(0);
				it.lineItems.forEach(item => {total += BigInt(item.grossSalesMoney.amount)});
				if (total == BigInt(2500)) {
					console.log("it's 25: " + it.id)
				}
				allGrossSales += total;
			}
			else {
				console.log("no lineItems: " + it.id);
			}
			
			if (it.totalMoney != undefined) {
				total += BigInt(it.totalMoney.amount);
			}
			if (it.totalDiscountMoney != undefined) {
				allDiscount += BigInt(it.totalDiscountMoney.amount);
			}
			if (it.totalServiceChargeMoney != undefined) {
				allService += BigInt(it.totalServiceChargeMoney.amount);
			}
			if (it.totalTaxMoney != undefined) {
				allTax += BigInt(it.totalTaxMoney.amount);
			}
			if (it.totalTipMoney != undefined) {
				allTips += BigInt(it.totalTipMoney.amount);
			}

			if (it.netAmounts != undefined) {
				for (const [key, value] of Object.entries(it.netAmounts)) {
					allNetAmmounts[key] += BigInt(value.amount);
				}
			}

		});

		let result = {};
		// resultString += ("total: " + total);
		result.allDiscount = allDiscount;
		result.allService = allService;
		result.allTax = allTax;
		result.allRefunds = allRefunds;
		result.allTips = allTips;
		// resultString += ("\n Net:");
		// for (const [key, value] of Object.entries(allReturns)) {
			// 	resultString += (key + ": " + value);
			// }
			
		let correctReturns = (allReturns.totalMoney - allReturns.tipMoney - allReturns.taxMoney);
		let netSales = (allGrossSales - correctReturns - allDiscounts);
		result.allGrossSales = allGrossSales;
		result.correctReturns = correctReturns;
		result.allDiscounts = allDiscounts;
		result.netSales = netSales;

		return result;
	} 
	catch(error) {
		console.log(error);
	}
}

async function getOrders2(locationID, startDay, endDay) {
	
	try {
		const response = await client.ordersApi.searchOrders({
			locationIds: [
				locationID
			],
			query: {
				filter: {
					stateFilter: {
					  states: [
						'COMPLETED'
					  ]
					},
					dateTimeFilter: {
						closedAt: {
							startAt: startDay + "T06:00:00.000",
							endAt: endDay + "T06:00:00.000"
						}
					}
				},
				sort: {
					sortField: 'CLOSED_AT',
					sortOrder: 'ASC'
				}
			},
			limit: 1000
		});

		if (response.result.orders == undefined || response.result.orders == null) {
			return "No data found for date range selected";
		}
		let orders = response.result.orders;

		let netSales = BigInt(0);
		let totalTenders = BigInt(0);
		let totalFee = BigInt(0);
		let totalRefunds = BigInt(0);

		let grossSales = BigInt(0);

		orders.forEach(order => {
			if (order.state != "COMPLETED") {
				console.log("completed Lie: " + order.id);

				grossSales = addGross(grossSales, order);
			}

			if (order.tenders != undefined && order.tenders.length > 0) {
				order.tenders.forEach(tend => {
					totalTenders += BigInt(tend.amountMoney.amount);
					if (tend.processingFeeMoney != undefined) {
						totalFee += BigInt(tend.processingFeeMoney.amount);
					}
				});

				grossSales = addGross(grossSales, order);
			}

			if (order.refunds != undefined && order.refunds.length > 0) {
				console.log("refund: " + order.id);
				order.refunds.forEach(ref => {
					totalRefunds += BigInt(ref.amountMoney.amount);
					netSales -= BigInt(ref.amountMoney.amount)
				});

				grossSales = addGross(grossSales, order);
			}

			netSales += BigInt(order.totalMoney.amount);
		});

		return({
			netSales, totalTenders, totalFee, totalRefunds, grossSales
		});
	}
	catch (error) {
		console.log(error);
	}
}

function addGross(gross, order) {
	if (order.totalMoney != undefined) {
		gross += order.totalMoney.amount
	}
	if (order.tipMoney != undefined) {
		gross += order.tipMoney.amount
	}
	if (order.discountMoney != undefined) {
		gross += order.discountMoney.amount;
	}
	return gross;
}

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

let globalTotals = {};
async function getOrdersBruteForce(locationID, startDay, endDay) {
	try {
		let response = await query(locationID, startDay, endDay)
		if (response.result.orders == undefined || response.result.orders == null) {
			return "No data found for date range selected";
		}
		let orders = response.result.orders;
		console.log("FOUND: " + orders.length);

		let totalItems = 0;
		orders.forEach(order => {
			processObject(order, "")
			if (order.lineItems != undefined) totalItems += order.lineItems.length;
		})
		console.log("ITEMS: " + totalItems);

		return globalTotals;	
	} catch (error) {
		console.log(error)
	}
}

function processObject(it, parent) {
	for (const [key, value] of Object.entries(it)) {
		if (key == "amount") {
			if (globalTotals[parent] != undefined) {
				globalTotals[parent] += BigInt(value);
			}
			else {
				globalTotals[parent] = BigInt(value);
			}
			return;
		}
		switch (typeof value) {
			case "object":
				if (Array.isArray(value)) {
					value.forEach(item => {
						processObject(item, parent + "." + key)
					})
				}
				else {
					processObject(value, parent + "." + key)
				}
				break;
			case "string":
			case "int":
			case "bigint":
			case "number":
				break;
			default:
				console.log("unhandled key type: " + typeof value + "\nid: " + it.id);
				break;
		}
	}
}

async function query(locationID, startDay, endDay) {
	const response = await client.ordersApi.searchOrders({
		locationIds: [
			locationID
		],
		query: {
			filter: {
				stateFilter: {
          states: [
            'COMPLETED'
          ]
				},
				dateTimeFilter: {
					closedAt: {
						startAt: startDay + "T10:00:00.000Z",
						endAt: endDay + "T06:00:00.000Z"
					}
				}
			},
			sort: {
				sortField: 'CLOSED_AT',
				sortOrder: 'ASC'
			}
		},
		limit: 1000
	});

	return response;
}

// getOrders("9408KRRF2VWN2", 18);
// getOrders("3PHRKCNFYTXR0");

exports.getOrders = getOrders;
exports.getOrders2 = getOrders2;
exports.getOrdersBruteForce = getOrdersBruteForce;