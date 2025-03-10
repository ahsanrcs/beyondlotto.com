import React, { useEffect, useState } from "react";
import {
	multiFactor,
	PhoneAuthProvider,
	PhoneMultiFactorGenerator,
	RecaptchaVerifier,
	sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";
import { useStateValue } from "../State/Stateprovider";
import { showError, showSuccess } from "../utils/functions";
import Spin from "../utils/Spin";

const EnableTwoFactor = ({ setShowModal, setLoading }) => {
	const [emailVerified, setEmailVerified] = useState(
		auth.currentUser.emailVerified
	);
	const [verificationId, setVerificationId] = useState();
	const [verificationCode, setVerificationCode] = useState();
	const [{ user }] = useStateValue();

	const handleConfirm = async () => {
		try {
			const cred = PhoneAuthProvider.credential(
				verificationId,
				verificationCode
			);
			const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
			const res = await multiFactor(auth.currentUser).enroll(
				multiFactorAssertion,
				"Phone number"
			);
			console.log(res);
			setShowModal(false);
			showSuccess("Successfully enabled two factor authentication");
		} catch (e) {
			console.log(e);
			showError("Something went wrong!");
		}
	};

	const sendOTP = () => {
		setLoading(true);
		multiFactor(auth.currentUser)
			.getSession()
			.then(function (multiFactorSession) {
				const phoneInfoOptions = {
					phoneNumber: user.phone,
					session: multiFactorSession,
				};
				const phoneAuthProvider = new PhoneAuthProvider(auth);
				return phoneAuthProvider.verifyPhoneNumber(
					phoneInfoOptions,
					window.recaptchaVerifier
				);
			})
			.then(function (vId) {
				setVerificationId(vId);
				setLoading(false);
			})
			.catch((e) => {
				if (e.code === "auth/requires-recent-login") {
					showError("Please log in again");
					auth.signOut();
				} else if (e.code === "auth/second-factor-already-in-use") {
					showSuccess("Already enabled!");
					setLoading(false);
					setShowModal(false);
				} else {
					console.log(e);
					showError("Something went wrong");
					setLoading(false);
				}
			});
	};

	const initCaptcha = () => {
		window.recaptchaVerifier = new RecaptchaVerifier(
			"recaptcha-container",
			{
				size: "invisible",
			},
			auth
		);
	};

	useEffect(() => {
		if (emailVerified) {
			initCaptcha();
			sendOTP();
		} else {
			sendEmailVerification(auth.currentUser)
				.then((res) => showSuccess("Email sent"))
				.catch((e) => {
					console.log(e);
					showError("Couldn't send email");
				});
		}
	}, []);

	return (
		<div>
			{emailVerified ? (
				<>
					<div
						style={{
							background: "white",
							textAlign: "center",
							padding: "2rem 3rem 1rem 3rem",
							fontSize: "1rem",
						}}
					>
						We have sent you a verification code to your phone: {user.phone}
					</div>
					<div>
						<label>Enter OTP:</label>
						<input
							onChange={(e) => setVerificationCode(e.target.value)}
							value={verificationCode}
							type='number'
							className='form-control'
						/>
						<button className='btn btn-primary my-4' onClick={handleConfirm}>
							Submit
						</button>
					</div>
					<div id='recaptcha-container'></div>
				</>
			) : (
				<div
					style={{
						background: "white",
						textAlign: "center",
						padding: "2rem 3rem 1rem 3rem",
						fontSize: "1rem",
					}}
				>
					We have sent a link to your email. Please verify your email first.
				</div>
			)}
		</div>
	);
};

export default EnableTwoFactor;
