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


const apiContracts = require("authorizenet").APIContracts;
const apiControllers = require("authorizenet").APIControllers;
const { APIContracts, APIControllers } = require("authorizenet");
// const API_LOGIN_ID = "38rY9AnLGq4"; // sandbox
// const TRANSACTION_KEY = "2X98j5jjNFn57L84"; // sandbox
// const ENVIRONMENT = "https://apitest.authorize.net/xml/v1/request.api";

const API_LOGIN_ID = "73GnSt8f5"; // Production
const TRANSACTION_KEY = "8S4aYY68F9E8w5b4"; // Production
const ENVIRONMENT = "https://api.authorize.net/xml/v1/request.api";


const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "tvdisplayapp@gmail.com",
		pass: "knknxemxtcigmbep",
	},
});

exports.createAuthorizeSubscription = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, res) => {
	cors(req, res, async () => {
	  res.set("Access-Control-Allow-Origin", "*");
  
	  try {
		const data = req.body;
		console.log("Received request body:", req.body);
  
		// 🔹 Ensure required fields are provided
		if (!data.firstName || !data.lastName || !data.nameOnAccount || !data.accountType) {
		  return res.status(400).json({
			result: false,
			message: "First Name, Last Name, Name on Account, and Account Type are required.",
		  });
		}
  
		const userRef = db.collection("users").doc(data.userId);
		const userDoc = await userRef.get();
  
		if (!userDoc.exists) {
		  return res.status(404).json({ result: false, message: "User not found" });
		}
  
		const userData = userDoc.data();
		const plan = authorize_plans.find((p) => p.name === data.planType);
		if (!plan) {
		  return res.status(400).json({ result: false, message: "Plan not found" });
		}
  
		const merchantAuthenticationType = new apiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(API_LOGIN_ID);
		merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);
  
		const interval = new apiContracts.PaymentScheduleType.Interval();
		interval.setLength(1);
		interval.setUnit(apiContracts.ARBSubscriptionUnitEnum.MONTHS);
  
		const paymentScheduleType = new apiContracts.PaymentScheduleType();
		paymentScheduleType.setInterval(interval);
		paymentScheduleType.setStartDate(moment().format("YYYY-MM-DD"));
		paymentScheduleType.setTotalOccurrences(9999); // Infinite subscription
  
		// 🔹 Use tokenized ACH data from Accept.js
		const paymentType = new apiContracts.PaymentType();
		const opaqueData = new apiContracts.OpaqueDataType();
		opaqueData.setDataDescriptor(data.opaqueData.dataDescriptor);
		opaqueData.setDataValue(data.opaqueData.dataValue);
		paymentType.setOpaqueData(opaqueData);
  
		// 🔹 Add customer billing details
		const customerType = new apiContracts.CustomerType();
		customerType.setEmail(userData.email);
  
		const billTo = new apiContracts.CustomerAddressType();
		billTo.setFirstName(data.firstName);
		billTo.setLastName(data.lastName);
  
		const arbSubscription = new apiContracts.ARBSubscriptionType();
		arbSubscription.setPaymentSchedule(paymentScheduleType);
		arbSubscription.setAmount(plan.authorize_amount);
		arbSubscription.setPayment(paymentType);
		arbSubscription.setCustomer(customerType);
		arbSubscription.setBillTo(billTo); // 🔹 Ensure Billing Details are set
  
		const createRequest = new apiContracts.ARBCreateSubscriptionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setSubscription(arbSubscription);
  
		const ctrl = new apiControllers.ARBCreateSubscriptionController(createRequest.getJSON());
		ctrl.setEnvironment(ENVIRONMENT);
  
		// 🔹 Wrap `ctrl.execute()` in a Promise
		const executeController = () => {
		  return new Promise((resolve, reject) => {
			let timeout = setTimeout(() => {
			  reject("Authorize.Net request timed out.");
			}, 5000); // Timeout after 5s if no response
  
			ctrl.execute(() => {
			  try {
				const apiResponse = ctrl.getResponse();
				console.log("Authorize.Net Response:", JSON.stringify(apiResponse, null, 2));
  
				const response = new apiContracts.ARBCreateSubscriptionResponse(apiResponse);
				clearTimeout(timeout);
  
				if (response.getMessages().getResultCode() === apiContracts.MessageTypeEnum.OK) {
				  const subscriptionId = response.getSubscriptionId();
				  let customerProfileId = null;
  
				  if (response.getProfile() && response.getProfile().getCustomerProfileId) {
					customerProfileId = response.getProfile().getCustomerProfileId();
				  }
  
				  resolve({ subscriptionId, customerProfileId });
				} else {
				  const errorMessage = response.getMessages().getMessage()[0].getText();
				  console.error("Authorize.Net Error:", errorMessage);
				  
				  if (errorMessage.includes("Invalid Account Number")) {
					reject("Invalid bank account number. Please check and try again.");
				  } else if (errorMessage.includes("Invalid Routing Number")) {
					reject("Invalid routing number. Please enter a valid 9-digit number.");
				  } else {
					reject(errorMessage || "Payment processing failed. Please verify your payment details and try again.");
				  }
				}
			  } catch (error) {
				console.error("Authorize.Net Exception:", error.message);
				clearTimeout(timeout);
				reject(error.message);
			  }
			});
		  });
		};
  
		//  Await the API response
		const { subscriptionId, customerProfileId } = await executeController();
  
		//  Update Firestore after successful subscription creation
		await userRef.update({
		  account_type: data.planType, //  Save account type
		  subscription_date: moment().format("YYYY-MM-DD"),
		  subscription_expires: moment().add(1, "months").format("YYYY-MM-DD"),
		  authorize_subscription_id: subscriptionId,
		  authorize_customer_id: customerProfileId, 
		  is_paid_user: true,
		  payment_type: "ACH",
		  payment_reason: "Paid via ACH",
		});
  
		//  Add subscription details to Firestore
		await db
		  .collection("users")
		  .doc(data.userId)
		  .collection("subscriptions")
		  .add({
			subscriptionId,
			plan: plan.name,
			startDate: moment().format("YYYY-MM-DD"),
			endDate: moment().add(1, "months").format("YYYY-MM-DD"),
			amount: plan.authorize_amount,
			status: "Active",
		  });
  
		return res.status(200).json({
		  result: true,
		  message: "Subscription created successfully",
		  subscriptionId,
		});
	  } catch (error) {
		console.error(" Error creating subscription:", error);
		return res.status(500).json({
		  result: false,
		  message: "Server Error",
		  error: error.message || error,
		});
	  }
	});
  });
  
  exports.cancelAuthorizeSubscription = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, res) => {
	cors(req, res, async () => {
	  res.set("Access-Control-Allow-Origin", "*");
  
	  try {
		// const { userId } = req.body;
		const data = JSON.parse(req.body);
		const userId = data.userId;
  
		if (!userId) {
		  return res.status(400).json({ result: false, message: "User ID is required" });
		}
  
		// Fetch user data from Firestore
		const userRef = db.collection("users").doc(userId);
		const userDoc = await userRef.get();
  
		if (!userDoc.exists) {
		  return res.status(404).json({ result: false, message: "User not found" });
		}
  
		const userData = userDoc.data();
		const { authorize_subscription_id, authorize_customer_id } = userData;
  
		if (!authorize_subscription_id && !authorize_customer_id) {
		  return res.status(400).json({ result: false, message: "No active ACH subscription found" });
		}
  
		const merchantAuthenticationType = new apiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(API_LOGIN_ID);
		merchantAuthenticationType.setTransactionKey(TRANSACTION_KEY);
  
		//  Create request to cancel the subscription
		const cancelRequest = new apiContracts.ARBCancelSubscriptionRequest();
		cancelRequest.setMerchantAuthentication(merchantAuthenticationType);
		cancelRequest.setSubscriptionId(authorize_subscription_id);
  
		const ctrl = new apiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());
		ctrl.setEnvironment(ENVIRONMENT);
  
		//  Wrap `ctrl.execute()` in a Promise
		const executeController = () => {
		  return new Promise((resolve, reject) => {
			let timeout = setTimeout(() => {
			  reject("Authorize.Net request timed out.");
			}, 5000);
  
			ctrl.execute(() => {
			  try {
				const apiResponse = ctrl.getResponse();
				console.log("Authorize.Net Cancel Response:", JSON.stringify(apiResponse, null, 2));
  
				const response = new apiContracts.ARBCancelSubscriptionResponse(apiResponse);
				clearTimeout(timeout);
  
				if (response.getMessages().getResultCode() === apiContracts.MessageTypeEnum.OK) {
				  resolve(true);
				} else {
				  console.error("Authorize.Net Cancel Error:", response.getMessages().getMessage()[0].getText());
				  reject(response.getMessages().getMessage()[0].getText());
				}
			  } catch (error) {
				console.error("Authorize.Net Cancel Exception:", error.message);
				clearTimeout(timeout);
				reject(error.message);
			  }
			});
		  });
		};
  
		// Await the cancellation response
		await executeController();
  
		//  Update Firestore after successful cancellation
		await userRef.update({
		  authorize_subscription_id: "",
		  authorize_customer_id: "",
		  is_paid_user: false,
		  payment_type: "ACH",
		  payment_reason: `ACH canceled on ${moment().format("YYYY-MM-DD")}`,
		});
  
		return res.status(200).json({
		  result: true,
		  message: "Subscription canceled successfully",
		});
  
	  } catch (error) {
		console.error(" Error canceling subscription:", error);
		return res.status(500).json({
		  result: false,
		  message: "Server Error",
		  error: error.message || error,
		});
	  }
	});
  });
  
  exports.authorizeWebhook = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
	  const event = req.body;
	  console.log("Event Payload:", JSON.stringify(event, null, 2)); // Log the payload
  
	  try {
		let userId;
		let userSnap;
		let month_days;
		let exp_date;
  
		switch (event.eventType) {
		  case "net.authorize.customer.subscription.updated":
			const customerProfileId = event.payload.profile.customerProfileId; // ✅ Correctly fetch customerProfileId
  
			userSnap = await db
			  .collection("users")
			  .where("authorize_customer_id", "==", customerProfileId)
			  .get();
  
			if (userSnap.empty) {
			  console.warn("No user found for CustomerProfileId:", customerProfileId);
			  return res.status(404).send("User not found");
			}
  
			userSnap.forEach((doc) => (userId = doc.id)); // ✅ Get user document ID
  
			const userRef = db.collection("users").doc(userId);
			const userData = (await userRef.get()).data();
  
			// 🔹 Extend the subscription by 30 days from the last expiration date
			const lastExpiryDate = userData.subscription_expires
			  ? moment(userData.subscription_expires, "YYYY-MM-DD")
			  : moment();
  
			exp_date = lastExpiryDate.add(30, "days").format("YYYY-MM-DD");
  
			await userRef.update({
			  subscription_expires: exp_date,
			  is_paid_user: true,
			  payment_type: "ACH",
			  payment_reason: "Paid via ACH",
			});
  
			// 🔹 Save the invoice details for record-keeping
			await db.collection("users").doc(userId).collection("invoices").add(event.payload);
  
			console.log(`Subscription successfully renewed. Next expiry: ${exp_date}`);
			break;
  
			case "net.authorize.payment.chargeback":
			case "net.authorize.customer.subscription.failed":
			case "net.authorize.customer.subscription.suspended":
			case "net.authorize.customer.subscription.terminated":
			case "net.authorize.customer.subscription.expired":
				userSnap = await db
				  .collection("users")
				  .where("authorize_customer_id", "==", event.payload.profile.customerProfileId)
				  .get();
				userSnap.forEach((s) => (userId = s.id));
	  
				if (userId) {
				  await db.collection("users").doc(userId).update({
					is_paid_user: false,
					payment_type: "ACH Failed",
					payment_reason: "Payment Failed on ACH",
				  });
	  
				  await db
					.collection("users")
					.doc(userId)
					.collection("invoices")
					.add({ 
					  transactionId: event.payload.id,
					  amount: event.payload.amount,
					  status: "Failed",
					  reason: event.payload.reason || "ACH payment failed",
					  date: moment().format("YYYY-MM-DD"),
					});
				}
				break;
	  
  
		  default:
			console.log("Unhandled event type:", event.eventType);
			break;
		}
  
		res.status(200).send("OK"); // Send success response
	  } catch (e) {
		console.error(e);
		res.status(500).send("Internal Server Error"); // Send error response
	  }
	});
  });
  exports.testauthorizeWebhook = functions.https.onRequest(async (req, res) => {
	cors(req, res, async () => {
	  const event = req.body;
	  console.log("Received Webhook Event:", JSON.stringify(event, null, 2)); 
  
	  try {
		let userId;
		let userSnap;
		let exp_date;
  
		console.log("Event Type:", event.eventType);
  
		switch (event.eventType) {
		  case "net.authorize.customer.subscription.updated":
			const customerProfileId = event.payload.profile.customerProfileId; // ✅ Correctly fetch customerProfileId
  
			userSnap = await db
			  .collection("users")
			  .where("authorize_customer_id", "==", customerProfileId)
			  .get();
  
			if (userSnap.empty) {
			  console.warn("No user found for CustomerProfileId:", customerProfileId);
			  return res.status(404).send("User not found");
			}
  
			userSnap.forEach((doc) => (userId = doc.id)); // ✅ Get user document ID
  
			const userRef = db.collection("users").doc(userId);
			const userData = (await userRef.get()).data();
  
			// 🔹 Extend the subscription by 30 days from the last expiration date
			const lastExpiryDate = userData.subscription_expires
			  ? moment(userData.subscription_expires, "YYYY-MM-DD")
			  : moment();
  
			exp_date = lastExpiryDate.add(30, "days").format("YYYY-MM-DD");
  
			await userRef.update({
			  subscription_expires: exp_date,
			  is_paid_user: true,
			  payment_status: "Paid",
			});
  
			// 🔹 Save the invoice details for record-keeping
			await db.collection("users").doc(userId).collection("invoices").add(event.payload);
  
			console.log(`Subscription successfully renewed. Next expiry: ${exp_date}`);
			break;
  
		  default:
			console.log("Unhandled event type:", event.eventType);
			break;
		}
  
		res.status(200).send("Webhook processed successfully");
	  } catch (error) {
		console.error("Error processing webhook:", error);
		res.status(500).send("Internal Server Error");
	  }
	});
  });

  exports.syncAuthorizeSubscriptions = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .pubsub.schedule("30 23 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    console.log("Running scheduled Authorize.Net subscription sync...");

    const usersSnap = await db
      .collection("users")
      .where("authorize_subscription_id", ">", "")
      .get();

    console.log(`Found ${usersSnap.size} users to sync`);

    if (usersSnap.empty) {
      console.log("No users with subscription to sync. Exiting.");
      return res.status(200).send("No users to sync.");
    }

    const syncPromises = usersSnap.docs.map(async (doc) => {
      const userData = doc.data();
      const userId = doc.id;
      const subscriptionId = userData.authorize_subscription_id;
      const email = userData.email || "Unknown Email";

      try {
        const getRequest = new APIContracts.ARBGetSubscriptionRequest();
        getRequest.setMerchantAuthentication(
          new APIContracts.MerchantAuthenticationType({
            name: API_LOGIN_ID,
            transactionKey: TRANSACTION_KEY,
          })
        );
        getRequest.setSubscriptionId(subscriptionId);
        getRequest.setIncludeTransactions(true);

        const ctrl = new APIControllers.ARBGetSubscriptionController(getRequest.getJSON());
        ctrl.setEnvironment(ENVIRONMENT);

        const response = await new Promise((resolve, reject) => {
          ctrl.execute(() => {
            const apiResponse = ctrl.getResponse();
            const parsedResponse = new APIContracts.ARBGetSubscriptionResponse(apiResponse);

            if (parsedResponse.getMessages().getResultCode() !== "Ok") {
              return reject(parsedResponse.getMessages().getMessage()[0].getText());
            }

            resolve(parsedResponse);
          });
        });

        const subscription = response.getSubscription();
        const status = subscription.getStatus();
        const userRef = db.collection("users").doc(userId);
        if (status.toLowerCase() !== "active") {
          console.log(`User ${email} | Subscription is not active (${status})`);
          await userRef.update({
            is_paid_user: false,
          });
          return;
        }

        const arbTxnsWrapper = subscription.getArbTransactions();
        if (!arbTxnsWrapper) {
          console.log(`User ${email} | Subscription is not active (${status}) or no transactions.`);
          return;
        }

        let transactions = arbTxnsWrapper.getArbTransaction();
        if (!transactions) {
          console.log(`User ${email} | Subscription is not active (${status}) or no transactions ().`);
          return;
        }

        if (!Array.isArray(transactions)) {
          transactions = [transactions];
        }

        const lastTxn = transactions[0];
        if (!lastTxn.getSubmitTimeUTC()) {
          console.warn(`Authorize.Net error for user ${email} (ID: ${userId}, SubID: ${subscriptionId}): submitTimeUTC is missing`);
          return;
        }

        const lastTxnDate = moment(lastTxn.getSubmitTimeUTC());

        const interval = subscription.getPaymentSchedule().getInterval();
        let nextBillingDate = lastTxnDate.clone();

        if (interval.getUnit().toLowerCase() === "months") {
          nextBillingDate.add(interval.getLength(), "months");
        } else if (interval.getUnit().toLowerCase() === "days") {
          nextBillingDate.add(interval.getLength(), "days");
        }

        console.log(`User ${email} | Status: ${status} | Next Billing: ${nextBillingDate.format("YYYY-MM-DD")}`);

      // ✅ Add 3 days to the next billing date
        let expDate = nextBillingDate.clone().add(3, "days");


        const currentExpires = userData.subscription_expires
          ? moment(userData.subscription_expires, "YYYY-MM-DD")
          : null;

        
        console.log(
          `Updating ${email}: New expiry (${expDate.format("YYYY-MM-DD")}) > current expiry (${currentExpires ? currentExpires.format("YYYY-MM-DD") : "none"})`
        );

        if (!currentExpires || expDate.isAfter(currentExpires)) {
          await userRef.update({
            subscription_expires: expDate.format("YYYY-MM-DD"),
            is_paid_user: true,
            payment_type: "ACH",
            payment_reason: "Synced from Authorize.Net",
          });
        } else {
          console.log(`Skipping update for ${email}: New expiry not newer`);
        }
      } catch (error) {
        console.warn(
          `Authorize.Net error for user ${email} (ID: ${userId}, SubID: ${subscriptionId}): ${error}`
        );
      }
    });

    await Promise.all(syncPromises);

    console.log("Manual Authorize.Net subscription sync complete.");
    return null;
  });

exports.testAuthorizeSync = functions
  .runWith({ timeoutSeconds: 300, memory: "512MB" })
  .https.onRequest(async (req, res) => {
    console.log("Running scheduled Authorize.Net subscription sync...");

    const usersSnap = await db
      .collection("users")
      .where("authorize_subscription_id", ">", "")
      .get();

    console.log(`Found ${usersSnap.size} users to sync`);

    if (usersSnap.empty) {
      console.log("No users with subscription to sync. Exiting.");
      return res.status(200).send("No users to sync.");
    }

    const syncPromises = usersSnap.docs.map(async (doc) => {
      const userData = doc.data();
      const userId = doc.id;
      const subscriptionId = userData.authorize_subscription_id;
      const email = userData.email || "Unknown Email";

      try {
        const getRequest = new APIContracts.ARBGetSubscriptionRequest();
        getRequest.setMerchantAuthentication(
          new APIContracts.MerchantAuthenticationType({
            name: API_LOGIN_ID,
            transactionKey: TRANSACTION_KEY,
          })
        );
        getRequest.setSubscriptionId(subscriptionId);
        getRequest.setIncludeTransactions(true);

        const ctrl = new APIControllers.ARBGetSubscriptionController(getRequest.getJSON());
        ctrl.setEnvironment(ENVIRONMENT);

        const response = await new Promise((resolve, reject) => {
          ctrl.execute(() => {
            const apiResponse = ctrl.getResponse();
            const parsedResponse = new APIContracts.ARBGetSubscriptionResponse(apiResponse);

            if (parsedResponse.getMessages().getResultCode() !== "Ok") {
              return reject(parsedResponse.getMessages().getMessage()[0].getText());
            }

            resolve(parsedResponse);
          });
        });

        const subscription = response.getSubscription();
        const status = subscription.getStatus();
        const userRef = db.collection("users").doc(userId);
        if (status.toLowerCase() !== "active") {
          console.log(`User ${email} | Subscription is not active (${status})`);
          await userRef.update({
            is_paid_user: false,
          });
          return;
        }

        const arbTxnsWrapper = subscription.getArbTransactions();
        if (!arbTxnsWrapper) {
          console.log(`User ${email} | Subscription is not active (${status}) or no transactions.`);
          return;
        }

        let transactions = arbTxnsWrapper.getArbTransaction();
        if (!transactions) {
          console.log(`User ${email} | Subscription is not active (${status}) or no transactions ().`);
          return;
        }

        if (!Array.isArray(transactions)) {
          transactions = [transactions];
        }

        const lastTxn = transactions[0];
        if (!lastTxn.getSubmitTimeUTC()) {
          console.warn(`Authorize.Net error for user ${email} (ID: ${userId}, SubID: ${subscriptionId}): submitTimeUTC is missing`);
          return;
        }

        const lastTxnDate = moment(lastTxn.getSubmitTimeUTC());

        const interval = subscription.getPaymentSchedule().getInterval();
        let nextBillingDate = lastTxnDate.clone();

        if (interval.getUnit().toLowerCase() === "months") {
          nextBillingDate.add(interval.getLength(), "months");
        } else if (interval.getUnit().toLowerCase() === "days") {
          nextBillingDate.add(interval.getLength(), "days");
        }

        console.log(`User ${email} | Status: ${status} | Next Billing: ${nextBillingDate.format("YYYY-MM-DD")}`);

      // ✅ Add 3 days to the next billing date
        let expDate = nextBillingDate.clone().add(3, "days");


        const currentExpires = userData.subscription_expires
          ? moment(userData.subscription_expires, "YYYY-MM-DD")
          : null;

        
        console.log(
          `Updating ${email}: New expiry (${expDate.format("YYYY-MM-DD")}) > current expiry (${currentExpires ? currentExpires.format("YYYY-MM-DD") : "none"})`
        );

        if (!currentExpires || expDate.isAfter(currentExpires)) {
          await userRef.update({
            subscription_expires: expDate.format("YYYY-MM-DD"),
            is_paid_user: true,
            payment_type: "ACH",
            payment_reason: "Synced from Authorize.Net",
          });
        } else {
          console.log(`Skipping update for ${email}: New expiry not newer`);
        }
      } catch (error) {
        console.warn(
          `Authorize.Net error for user ${email} (ID: ${userId}, SubID: ${subscriptionId}): ${error}`
        );
      }
    });

    await Promise.all(syncPromises);

    console.log("Manual Authorize.Net subscription sync complete.");
    res.status(200).send("Manual Authorize.Net subscription sync complete.");
  });
  
// Authorize.Net Plans
const authorize_plans = [
	{
	  id: 1,
	  name: "basic",
	  label: "Basic",
	  authorize_amount: 20,
	  features: ["1 Lotto Display Screen"],
	  color: "#00cba5",
	  screens: [1],
	  live: false,
	  interval: "1",
	},
	{
	  id: 2,
	  name: "standard",
	  label: "Standard",
	  authorize_amount: 25,
	  features: ["1 Lotto Display Screen", "Live Updates"],
	  color: "#fcba39",
	  screens: [1],
	  live: true,
	  interval: "1",
	},
	{
	  id: 3,
	  name: "ultimate",
	  label: "Ultimate",
	  authorize_amount: 40,
	  features: ["2 Lotto Display Screen", "Live Updates"],
	  color: "#f96c6c",
	  screens: [1, 2],
	  live: true,
	  interval: "1",
	},
	{
	  id: 4,
	  name: "premium",
	  label: "Premium",
	  authorize_amount: 55,
	  features: [
		"1 Lotto Display Screen",
		"Live Updates",
		"2 Ads Display Screen",
	  ],
	  color: "#808081",
	  screens: [1, 3, 4],
	  live: true,
	  interval: "1",
	},
	{
	  id: 5,
	  name: "business",
	  label: "Business",
	  authorize_amount: 65,
	  features: [
		"2 Lotto Display Screen",
		"Live Updates",
		"3 Ads Display Screen",
	  ],
	  color: "#a8821a",
	  screens: [1, 2, 3, 4, 5],
	  live: true,
	  interval: "1",
	},
  ];

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
