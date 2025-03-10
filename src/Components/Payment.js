import { doc, getDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { useStateValue } from "../State/Stateprovider";
import { showError, showSuccess } from "../utils/functions";

const Payment = ({ plan, setOpenModal }) => {
	const [card, setCard] = useState();
	const [loading, setLoading] = useState(false);
	const [{ user }, action] = useStateValue();

	const updateUser = async () => {
		getDoc(doc(db, "users", user.id))
			.then((doc) => {
				action({
					type: "SET_USER",
					payload: {
						user: {
							id: doc.id,
							...doc.data(),
						},
					},
				});
			})
			.catch((e) => {
				console.error(e);
			});
	};

	async function initializeCard(payments) {
		const card = await payments.card();
		await card.attach("#card-container");
		return card;
	}

	async function createPayment(token) {
		const body = JSON.stringify({
			locationId: process.env.REACT_APP_SQUARE_LOCATION_ID,
			sourceId: token,
			planId: plan.id,
			userId: user.id,
		});
		const paymentResponse = await fetch(
			process.env.REACT_APP_SERVER_URL + "/createPayment",
			{
				method: "POST",
				body,
			}
		);
		console.log("paymentResponse", paymentResponse);
		if (paymentResponse.ok) {
			return paymentResponse.json();
		}
		const errorBody = await paymentResponse.json();
		console.log("errorbody", errorBody);
		// showError("Something went wrong");
		throw new Error(errorBody?.message || (await paymentResponse.text()));
	}

	async function tokenize(paymentMethod) {
		const tokenResult = await paymentMethod.tokenize();
		if (tokenResult.status === "OK") {
			return tokenResult.token;
		} else {
			let errorMessage = `Tokenization failed-status: ${tokenResult.status}`;
			if (tokenResult.errors) {
				errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
			}
			throw new Error(errorMessage);
		}
	}

	async function handlePaymentMethodSubmission(event, paymentMethod = card) {
		event.preventDefault();
		setLoading(true);

		const cardButton = document.getElementById("card-button");

		try {
			cardButton.disabled = true;
			const token = await tokenize(paymentMethod);
			const paymentResults = await createPayment(token);
			showSuccess("Payment Successful");
			updateUser();
			setOpenModal(false);

			console.debug("Payment Success", paymentResults);
		} catch (e) {
			cardButton.disabled = false;
			showError(e?.message || "Something went wrong");
			console.error("e.message", e.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const init = async () => {
			const appId = process.env.REACT_APP_SQUARE_APP_ID;
			const locationId = process.env.REACT_APP_SQUARE_LOCATION_ID;
			if (!window.Square) {
				throw new Error("Square.js failed to load properly");
			}
			const payments = window.Square.payments(appId, locationId);
			try {
				const cardInstance = await initializeCard(payments);
				setCard(cardInstance);
			} catch (e) {
				console.error("Initializing Card failed", e);
				showError("Payment method initialization failed");
				return;
			}
		};
		init();
	}, [window.Square]);

	return (
		<div>
			<form id='payment-form'>
				<div id='card-container'></div>
				<button
					onClick={handlePaymentMethodSubmission}
					id='card-button'
					className='btn'
					style={{ padding: "15px 40px", background: "#02df70" }}
				>
					{loading && (
						<span
							className='spinner-border spinner-border-sm mr-2'
							role='status'
							aria-hidden='true'
						></span>
					)}
					Pay ${parseFloat(plan?.price).toFixed(2)}
				</button>
			</form>
		</div>
	);
};

export default Payment;
