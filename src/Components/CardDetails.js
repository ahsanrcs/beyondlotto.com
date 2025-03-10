import React, { useState, useEffect } from "react";
import { useStateValue } from "../State/Stateprovider";
import { showError, showSuccess } from "../utils/functions";

const CardDetails = ({ setShowCardModal }) => {
	const [card, setCard] = useState();
	const [cardData, setCardData] = useState("");
	const [loading, setLoading] = useState(false);
	const [{ user }, action] = useStateValue();

	const getCardDetails = async () => {
		try {
			setLoading(true);
			const body = JSON.stringify({
				userId: user.id,
			});
			const res = await fetch(
				process.env.REACT_APP_SERVER_URL + "/getCardInfo",
				{
					method: "POST",
					body,
				}
			);
			const data = await res.json();
			console.log(res.body);
			if (res.ok) {
				setCardData(data.data);
				// setShowCancelModal(false);
			}
			// updateUser();
		} catch (e) {
			console.log(e);
			showError(e?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	async function initializeCard(payments) {
		const card = await payments.card();
		await card.attach("#card-container");
		return card;
	}

	console.log(cardData);

	async function createPayment(token) {
		const body = JSON.stringify({
			locationId: process.env.REACT_APP_SQUARE_LOCATION_ID,
			sourceId: token,
			// planId: plan.id,
			userId: user.id,
		});
		const paymentResponse = await fetch(
			process.env.REACT_APP_SERVER_URL + "/updateCard",
			{
				method: "POST",
				body,
			}
		);
		console.log(paymentResponse);
		if (paymentResponse.ok) {
			return paymentResponse.json();
		}
		const errorBody = await paymentResponse.text();
		console.log(errorBody);
		showError("Something went wrong");
		throw new Error(errorBody);
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
			showSuccess("Card updated");
			setShowCardModal(false);

			console.debug("Payment Success", paymentResults);
		} catch (e) {
			cardButton.disabled = false;
			showError("Something went wrong");
			console.error(e.message);
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
		getCardDetails();
	}, [window.Square]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				color: "black",
				background: "white",
				padding: "10px 15px",
			}}
		>
			{cardData && (
				<div style={{ margin: "10px 0 20px 0" }}>
					<strong>Current Card: </strong>
					<span>
						{cardData?.cardBrand} {cardData?.cardType} ****{cardData?.last4} (
						{cardData?.cardholderName})
					</span>
				</div>
			)}
			<div>
				<form
					id='payment-form'
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
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
						Update Card
					</button>
				</form>
			</div>
		</div>
	);
};

export default CardDetails;
