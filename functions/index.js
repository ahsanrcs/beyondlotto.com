/* eslint-disable */
require("firebase-functions/lib/logger/compat");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

const { Client, Environment } = require("square");
const { nanoid } = require("nanoid");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const client = new Client({
	environment: Environment.Production,
	accessToken:
		"EAAAEJ3H1TKHZbVDUhDW4QB5bqqxZ8RN4kp271zGjqedr-01Vjfen9ziktW7dX1s",
	//Production= "EAAAEJ3H1TKHZbVDUhDW4QB5bqqxZ8RN4kp271zGjqedr-01Vjfen9ziktW7dX1s",
	//Sandbox=EAAAEJaiKSfequgYG_oCQ6kianWWf-S23PIRaIkSmOUMP4Ghn7CtwvgGoOZt2YLd
	//localsandbox=EAAAEAVV_idqf2DQt3NbFWSxujJ3q0WM8BbSvyplXrmZ493U8A8dIE1S4Vl4h6t0
});

const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "tvdisplayapp@gmail.com",
		pass: "knknxemxtcigmbep",
	},
});

const parse = {
	"All or Nothing logo": "all_or_nothing",
	"Cash 5 logo": "cash_five",
	"Mega Millions logo": "mega_ball",
	"Powerball logo": "power_ball",
	"Lotto logo": "texas_loto",
	"TTS logo": "texas_two_step",
};

exports.updateGlobalSettings = functions.pubsub
	.schedule("every 5 hours")
	.onRun(async (context) => {
		const url = "https://www.texaslottery.com/export/sites/lottery/index.html";
		const res = await axios.get(url);
		const $ = cheerio.load(res.data);

		const listItems = $("#GamesGrid .homePageCell");

		const data = {};

		listItems.each(function (idx, el) {
			const key = $(el).find("img").attr("alt");

			if (!parse[key]) return;

			data[parse[key]] = $(el).find("h1").text();
		});

		data["updated_at"] = new Date();

		db.collection("settings")
			.doc("global")
			.update(data)
			.then(() => {
				console.log({ status: "success", values: data });
				return true;
			})
			.catch((err) => {
				console.log({ status: "error", message: err });
				return false;
			});
	});

exports.deleteAccount = functions.https.onRequest((req, res) => {
	cors(req, res, () => {
		try {
			const data = JSON.parse(req.body);
			const id = data.id;
			if (!id) {
				res.status(400).json({
					result: false,
					message: "Invalid User",
				});
				return;
			}

			auth
				.deleteUser(id)
				.then(() => {
					db.collection("users")
						.doc(id)
						.delete()
						.then(() => {
							res.json({ result: true, message: "Succesfully Deleted" });
						})
						.catch((e) => {
							console.log(e);
							res.json({ result: false, message: "Error removing user data" });
						});
				})
				.catch((e) => {
					console.log(e);
					return { result: false, message: "Invalid User" };
				});
		} catch (e) {
			console.log(e);
			res.status(500).json({ result: false, message: "Server Error" });
		}
	});
});

exports.changePassword = functions.https.onRequest((req, res) => {
	cors(req, res, async () => {
		try {
			const data = JSON.parse(req.body);
			const { id, pass } = data;
			if (!id || !pass) {
				res.status(400).json({
					result: false,
					message: "Invalid Credentials",
				});
				return;
			}
			auth
				.updateUser(id, { password: pass })
				.then(() => {
					res.json({ result: true, message: "Password Succesfully Changed" });
				})
				.catch((e) => {
					console.log(e);
					res.json({ result: false, message: "Error changing password" });
				});
		} catch (e) {
			console.log(e);
			res.status(500).json({ result: false, message: "Server Error" });
		}
	});
});

exports.createPayment = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
		const payload = JSON.parse(req.body);

		try {
			const idempotencyKey = payload.idempotencyKey || nanoid();
			const plan = plans.find((p) => p.id === payload.planId);

			const userSnap = await db.collection("users").doc(payload.userId).get();
			const user = userSnap.data();

			let square_id, card_id, sub_id, sub_details;

			if (user.sub_id) {
				console.error("User is already subscribed!");
				res
					.status(400)
					.json({ result: false, message: "User is already subscribed!" });

				return;
			}

			if (!user.square_id) {
				if (!user.email) {
					console.log("No valid email");
					res
						.status(400)
						.json({ result: false, message: "User has no valid email" });

					return;
				}

				try {
					const customerResponse = await client.customersApi.createCustomer({
						idempotencyKey,
						givenName: user.name || "N/A",
						familyName: user.name || "N/A",
						emailAddress: user.email,
					});

					console.log("customerResponse", customerResponse.result);
					square_id = customerResponse.result.customer.id;
				} catch (error) {
					console.log(error);
					res
						.status(500)
						.json({ result: false, message: "Customer creation failed" });

					return;
				}
			} else {
				square_id = user.square_id;
			}

			try {
				const cardResponse = await client.cardsApi.createCard({
					idempotencyKey: nanoid(),
					sourceId: payload.sourceId,
					card: {
						cardholderName: user.name || "N/A",
						// billingAddress: {
						// 	addressLine1: "500 Electric Ave",
						// 	addressLine2: "Suite 600",
						// 	locality: "New York",
						// 	administrativeDistrictLevel1: "NY",
						// 	postalCode: "94103",
						// 	country: "US",
						// },
						customerId: square_id,
					},
				});

				console.log(cardResponse.result);
				card_id = cardResponse.result.card.id;
			} catch (error) {
				console.log(error);
				res
					.status(500)
					.json({ result: false, message: "Card creation failed" });

				return;
			}

			try {
				const subResponse = await client.subscriptionsApi.createSubscription({
					idempotencyKey: nanoid(),
					locationId: payload.locationId,
					planId: plan.square_id,
					cardId: card_id,
					customerId: square_id,
				});

				console.log(subResponse.result);
				sub_details = subResponse.result.subscription;
				sub_id = subResponse.result.subscription.id;
			} catch (error) {
				console.log(error);
				console.log(error);
				res
					.status(500)
					.json({ result: false, message: "Something went wrong" });

				return;
			}

			// const payment = {
			// 	idempotencyKey,
			// 	locationId: payload.locationId,
			// 	sourceId: payload.sourceId,
			// 	amountMoney: {
			// 		amount: plan.price * 100,
			// 		currency: "USD",
			// 	},
			// };

			// if (payload.customerId) {
			// 	payment.customerId = payload.customerId;
			// }

			// if (payload.verificationToken) {
			// 	payment.verificationToken = payload.verificationToken;
			// }

			// const { result, statusCode } = await client.paymentsApi.createPayment(
			// 	payment
			// );

			await db
				.collection("users")
				.doc(payload.userId)
				.update({
					account_type: plan.name,
					subscription_date: moment().format("YYYY-MM-DD"),
					subscription_expires: moment().add(31, "days").format("YYYY-MM-DD"),
					is_paid_user: true,
					square_id,
					sub_id,
					card_id,
				});

			await db
				.collection("users")
				.doc(payload.userId)
				.collection("Subscriptions")
				.add(sub_details);

			const resData = {
				success: true,
				message: "Subscription successful",
				// payment: {
				// 	id: result.payment.id,
				// 	status: result.payment.status,
				// 	receiptUrl: result.payment.receiptUrl,
				// 	orderId: result.payment.orderId,
				// },
			};

			console.log(resData);
			res.status(200).json(resData);
		} catch (ex) {
			console.log(ex);
			res.status(400).json({ message: ex });
		}
	});
});

exports.cancelSubscription = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
		const payload = JSON.parse(req.body);

		try {
			const userSnap = await db.collection("users").doc(payload.userId).get();
			const user = userSnap.data();

			if (!user.sub_id) {
				res.status(404).json({ ok: false, message: "Subscription not found" });
				return;
			}

			await client.subscriptionsApi.cancelSubscription(user.sub_id);

			await db.collection("users").doc(payload.userId).update({
				sub_id: null,
			});

			res.status(200).json({
				success: true,
				message: "Subscription successfully cancelled",
			});
		} catch (ex) {
			console.log(ex);
			res.status(400).json({ message: ex });
		}
	});
});

exports.getCardInfo = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
		const payload = JSON.parse(req.body);

		try {
			const userSnap = await db.collection("users").doc(payload.userId).get();
			const user = userSnap.data();

			if (!user.card_id) {
				res.status(404).json({ ok: false, message: "Card not found" });
				return;
			}

			const d = await client.cardsApi.retrieveCard(user.card_id);

			const obj = {};

			for (const [key, value] of Object.entries(d.result.card)) {
				if (typeof value != "bigint") obj[key] = value;
			}

			console.log(obj);

			// await db.collection("users").doc(payload.userId).update({
			// 	sub_id: null,
			// });

			res.status(200).json({
				success: true,
				data: obj,
			});
		} catch (ex) {
			console.log(ex);
			res.status(400).json({ message: ex });
		}
	});
});

exports.updateCard = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
		const payload = JSON.parse(req.body);

		try {
			const userSnap = await db.collection("users").doc(payload.userId).get();
			const user = userSnap.data();

			if (!user.sub_id || !user.sub_id) {
				res.status(404).json({ ok: false, message: "Subscription not found" });
				return;
			}

			let square_id = user.square_id,
				sub_id = user.sub_id,
				card_id;

			try {
				const cardResponse = await client.cardsApi.createCard({
					idempotencyKey: nanoid(),
					sourceId: payload.sourceId,
					card: {
						cardholderName: user.name || "N/A",
						// billingAddress: {
						// 	addressLine1: "500 Electric Ave",
						// 	addressLine2: "Suite 600",
						// 	locality: "New York",
						// 	administrativeDistrictLevel1: "NY",
						// 	postalCode: "94103",
						// 	country: "US",
						// },
						customerId: square_id,
					},
				});

				console.log(cardResponse.result);
				card_id = cardResponse.result.card.id;
			} catch (error) {
				console.log(error);
				res
					.status(500)
					.json({ result: false, message: "Card creation failed" });

				return;
			}

			try {
				const subResponse = await client.subscriptionsApi.updateSubscription(
					sub_id,
					{
						cardId: card_id,
					}
				);

				console.log(subResponse.result);
				sub_id = subResponse.result.subscription.id;
			} catch (error) {
				console.log(error);
				res
					.status(500)
					.json({ result: false, message: "Something went wrong" });

				return;
			}

			await db.collection("users").doc(payload.userId).update({
				sub_id,
				card_id,
			});

			res.status(200).json({
				success: true,
				message: "Card updated",
			});
		} catch (ex) {
			console.log(ex);
			res.status(400).json({ message: ex });
		}
	});
});

exports.sendMessage = functions.https.onRequest((req, res) => {
	cors(req, res, async () => {
		try {
			const data = JSON.parse(req.body);
			let mailDetails = {
				from: "tvdisplayapp@gmail.com",
				to: "tvdisplayapp@gmail.com",
				subject: `You received a message from ${data.name}`,
				html: `<h2>You have received a message via beyondlotto form</h2><br/><div><strong>Name: </strong> ${data.name} </div><div><strong>Email: </strong> ${data.email} </div><div><strong>Subject: </strong> ${data.subject} </div><div><strong>Message: </strong> ${data.message} </div><br/><div>Reply to <a href="mailto:${data.email}">${data.email}</a></div>`,
			};
			mailTransporter.sendMail(mailDetails, function (err, data) {
				if (err) {
					console.log("Error Occurs", err);
					res.status(500).json({ result: false, message: "Server Error" });
				} else {
					console.log("Email sent successfully");
					res.status(200).json({ result: true });
				}
			});
		} catch (e) {
			console.log(e);
			res.status(500).json({ result: false, message: "Server Error" });
		}
	});
});

exports.webhook = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
		const event = req.body;
		try {
			switch (event.type) {
				case "invoice.payment_made":
					let userId;
					const userSnap = await db
						.collection("users")
						.where("sub_id", "==", event.data.object.invoice.subscription_id)
						.get();
					userSnap.forEach((s) => (userId = s.id));

					console.log("UserSnap", userSnap);
					console.log("INVOICE", event.data.object.invoice);

					await db
						.collection("users")
						.doc(userId)
						.update({
							subscription_expires: moment()
								.add(31, "days")
								.format("YYYY-MM-DD"),
						});

					await db
						.collection("users")
						.doc(userId)
						.collection("invoices")
						.add(event.data.object.invoice);
					break;

				default:
					console.log("Not matched", event);
					break;
			}
		} catch (e) {
			console.error(e);
			let mailDetails = {
				from: "tvdisplayapp@gmail.com",
				to: ["arnob001.asa@gmail.com", "tvdisplayapp@gmail.com"],
				subject: `Subscription renewal failed!`,
				html: `<h2>One auto subscription renewal from Square failed.</h2><br/><div><strong>Subscription ID: </strong> ${
					event.data.object.invoice.subscription_id
				} </div><br/><div>Invoice: <br/> ${JSON.stringify(
					event.data.object.invoice
				)}</div><br/><div>Technical Error Details: <br/> ${e}</div>`,
			};
			mailTransporter.sendMail(mailDetails, function (err, data) {
				if (err) {
					console.log("Error Occurs", err);
				} else {
					console.log("Email sent successfully");
				}
			});
		} finally {
			res.status(200).send("ok");
		}
	});
});

const plans = [
	{
		id: 1,
		square_id: "YN4KRK4L3Q64PVRAFPKZBF4B",
		name: "basic",
		label: "Basic",
		features: ["1 Lotto Display Screen"],
		price: 20,
		color: "#00cba5",
		screens: [1],
		live: false,
	},
	{
		id: 2,
		square_id: "DWES34FI3IR5C237D6KZGRK4",
		name: "standard",
		label: "Standard",
		features: ["1 Lotto Display Screen", "Live Updates"],
		price: 25,
		color: "#fcba39",
		screens: [1],
		live: true,
	},
	{
		id: 3,
		square_id: "7A7MPOEMJKFKZQ4OHRNHABOT",
		name: "ultimate",
		label: "Ultimate",
		features: ["2 Lotto Display Screen", "Live Updates"],
		price: 40,
		color: "#f96c6c",
		screens: [1, 2],
		live: true,
	},
	{
		id: 4,
		square_id: "HEII3EBEQ4MEIEG4G27Q6PZV",
		name: "premium",
		label: "Premium",
		features: [
			"1 Lotto Display Screen",
			"Live Updates",
			"2 Ads Display Screen",
		],
		price: 55,
		color: "#808081",
		screens: [1, 3, 4],
		live: true,
	},
	{
		id: 5,
		square_id: "TY5FQ762LSNTEG7DJ5DNLDQM",
		name: "business",
		label: "Business",
		features: [
			"2 Lotto Display Screen",
			"Live Updates",
			"3 Ads Display Screen",
		],
		price: 65,
		color: "#a8821a",
		screens: [1, 2, 3, 4, 5],
		live: true,
	},
];
