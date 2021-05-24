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

async function getOrders(locationID, day) {
	
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
							startAt: "2021-05-" + day + "T00:00:00.000-07:00",
							endAt: "2021-05-" + day + "T23:59:00.000-07:00"
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
						console.log("discount weird: " + index);
					}
					total += BigInt(item.appliedMoney.amount)}
				);
				allDiscounts += total;
			}

			if (it.lineItems != undefined) {
				let total = BigInt(0);
				it.lineItems.forEach(item => {total += BigInt(item.grossSalesMoney.amount)});
				allGrossSales += total;
			}
			else {
				console.log("no lineItems: " + index);
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

		// console.log("total: " + total);
		console.log("\nallDiscount: " + allDiscount);
		console.log("allService: " + allService);
		console.log("allTax: " + allTax);	
		console.log("allRefunds: " + allRefunds);
		console.log("allTips: " + allTips);
		// console.log("\n Net:");
		// for (const [key, value] of Object.entries(allReturns)) {
			// 	console.log(key + ": " + value);
			// }
			
		console.log("\nGross Sales: " + centsToDollars(allGrossSales));
		let correctReturns = (allReturns.totalMoney - allReturns.tipMoney - allReturns.taxMoney);
		console.log("Returns:" + centsToDollars(correctReturns));
		console.log("Discount & Comps: " + centsToDollars(allDiscounts));
		let netSales = (allGrossSales - correctReturns - allDiscounts);
		console.log("Net Sales: " + centsToDollars(netSales));
	} 
	catch(error) {
		console.log(error);
	}
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

function centsToDollars(number) {
	return (parseFloat(number)/100).toFixed(2);
}

getOrders("9408KRRF2VWN2", 18);
// getOrders("3PHRKCNFYTXR0");