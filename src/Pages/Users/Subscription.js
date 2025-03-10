import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Helmet } from "react-helmet";
import Payment from "../../Components/Payment";
import { useStateValue } from "../../State/Stateprovider";
import { subscriptions } from "../../utils/constants";
import moment from "moment";
import { showError, showSuccess } from "../../utils/functions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Spin from "../../utils/Spin";
import CardDetails from "../../Components/CardDetails";

const Subscription = () => {
	const [openModal, setOpenModal] = useState(false);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [showCardModal, setShowCardModal] = useState(false);
	const [plan, setPlan] = useState(null);
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

	const handleCancel = async () => {
		try {
			setLoading(true);
			const body = JSON.stringify({
				userId: user.id,
			});
			const res = await fetch(
				process.env.REACT_APP_SERVER_URL + "/cancelSubscription",
				{
					method: "POST",
					body,
				}
			);
			console.log(res);
			if (res.ok) {
				showSuccess("Subscription cancelled");
				setShowCancelModal(false);
			}
			updateUser();
		} catch (e) {
			console.log(e);
			showError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<Spin spinning={loading} />
			<Helmet>
				<script
					async
					type='text/javascript'
					src='https://web.squarecdn.com/v1/square.js'
				></script>
			</Helmet>
			<div>
				<h4 className='text-center text-black font-bold'>Flexible Plans</h4>
				<div className='text-center text-gray'>
					Choose your subscription plan
				</div>
			</div>
			<div
				style={{ gap: "1rem" }}
				className='d-flex justify-content-center flex-wrap mt-5'
			>
				{subscriptions.map((s, _i) => (
					<div className='animate_card'>
						<div style={{ minHeight: "40px" }}>
							{(user.account_type || "basic") === s.name && (
								<div className='d-flex justify-content-center align-items-center text-center text-black'>
									<i
										style={{
											color: "#02df70",
											fontWeight: "bolder",
											fontSize: "1.5rem",
											marginRight: "10px",
										}}
										className='mdi mdi-check-circle-outline'
									></i>{" "}
									Current Plan
								</div>
							)}
						</div>
						<div style={{ boxShadow: "4px 4px 8px 2px rgba( 0, 0, 0, 0.2 )" }}>
							<div className='text-black'>
								<div
									style={{
										background: s.color,
										padding: "3rem 5rem",
										textAlign: "center",
										color: "white",
										display: "flex",
										flexDirection: "column",
										gap: "10px",
									}}
								>
									<div> {s.label} </div>
									<div style={{ fontSize: "2rem" }}>{`$${s.price}`}</div>
									<div>per month</div>
								</div>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-between",
									minHeight: "280px",
									padding: "20px",
								}}
							>
								<div>
									<div style={{ color: "black", lineHeight: "2rem" }}>
										{s.features.map((f, _i) => (
											<div
												style={{
													display: "flex",
													gap: "10px",
												}}
											>
												<i
													style={{
														color: "#02df70",
														fontWeight: "bolder",
														fontSize: "1.2rem",
													}}
													className='mdi mdi-check'
												></i>{" "}
												{f}
											</div>
										))}
									</div>
								</div>
								<div style={{ alignSelf: "center" }}>
									{!user?.sub_id ? (
										<button
											onClick={() => {
												setPlan(s);
												setOpenModal(true);
											}}
											style={{ background: s.color, padding: "15px 40px" }}
											className='btn'
										>
											ACTIVE
										</button>
									) : (
										user?.account_type === s.name && (
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: "10px",
												}}
											>
												<button
													onClick={() => setShowCardModal(true)}
													style={{ background: s.color, padding: "15px 40px" }}
													className='btn'
												>
													Update card
												</button>
												<button
													onClick={() => setShowCancelModal(true)}
													style={{ padding: "15px 40px" }}
													className='btn btn-outline-danger'
												>
													Cancel
												</button>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
			{/*}
			{subscriptions.map((s, _i) => {
				<div>{s.name}</div>;
			})} */}
			<Modal show={openModal} onHide={() => setOpenModal(null)} centered>
				<Modal.Header
					closeButton
					style={{ background: "white", color: "black" }}
				>
					<Modal.Title>
						<div className='text-center'>
							<div className='text-black'>{plan?.label} Plan</div>
						</div>
					</Modal.Title>
				</Modal.Header>
				<div
					style={{
						background: "white",
						color: "black",
						textAlign: "center",
						padding: "5rem 5rem 1rem 5rem",
						fontSize: "1.5rem",
					}}
				>
					<Payment plan={plan} setOpenModal={setOpenModal} />
				</div>
				<div
					style={{
						background: "white",
						color: "black",
						textAlign: "center",
						padding: "1rem 5rem 2rem 5rem",
						fontSize: "1rem",
					}}
				>
					Please contact support at{" "}
					<a style={{ color: "#02df70" }} href='tel:+16823860871'>
						+1 682 386 0871
					</a>{" "}
					in case of technical issues.
				</div>
				<Modal.Footer style={{ background: "white", color: "black" }}>
					<div>
						<button
							onClick={() => setOpenModal(false)}
							style={{ padding: "15px 40px" }}
							className='btn btn-danger'
						>
							Close
						</button>
					</div>
				</Modal.Footer>
			</Modal>
			<Modal
				show={showCancelModal}
				onHide={() => setShowCancelModal(false)}
				centered
			>
				<Modal.Header
					closeButton
					style={{ background: "white", color: "black" }}
				>
					<Modal.Title>
						<div className='text-center'>
							<div className='text-black'>{plan?.label} Plan</div>
						</div>
					</Modal.Title>
				</Modal.Header>
				<div
					style={{
						background: "white",
						color: "black",
						textAlign: "center",
						padding: "2rem 2rem",
						fontSize: "1.2rem",
						display: "flex",
						flexDirection: "column",
						gap: "5px",
					}}
				>
					<span className='h2 '>Are you sure?</span> <br /> Your subscription
					will no longer be active after{" "}
					<span className='text-danger'>{user?.subscription_expires}</span>
				</div>
				<div
					style={{
						background: "white",
						color: "black",
						textAlign: "center",
						padding: "1rem 5rem 2rem 5rem",
						fontSize: "1rem",
					}}
				>
					Please contact support at{" "}
					<a style={{ color: "#02df70" }} href='tel:+16823860871'>
						+1 682 386 0871
					</a>{" "}
					in case of technical issues.
				</div>
				<Modal.Footer style={{ background: "white", color: "black" }}>
					<div>
						<button
							onClick={() => setOpenModal(false)}
							style={{ padding: "15px 40px" }}
							className='btn btn-outline-dark'
						>
							Cancel
						</button>
					</div>
					<div>
						<button
							onClick={handleCancel}
							style={{ padding: "15px 40px" }}
							className='btn btn-danger'
						>
							Yes
						</button>
					</div>
				</Modal.Footer>
			</Modal>
			<Modal
				show={showCardModal}
				onHide={() => setShowCardModal(false)}
				centered
			>
				<Modal.Header
					closeButton
					style={{ background: "white", color: "black" }}
				>
					<Modal.Title>
						<div className='text-center'>
							<div className='text-black'>Card details</div>
						</div>
					</Modal.Title>
				</Modal.Header>
				<CardDetails setShowCardModal={setShowCardModal} />
				<Modal.Footer style={{ background: "white", color: "black" }}>
					{null}
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default Subscription;
