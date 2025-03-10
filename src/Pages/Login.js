import React, { Component, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useStateValue } from "../State/Stateprovider";
import {
	getMultiFactorResolver,
	PhoneAuthProvider,
	PhoneMultiFactorGenerator,
	RecaptchaVerifier,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { showError, showSuccess } from "../utils/functions";

const Login = () => {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [codeSent, setCodeSent] = useState(false);
	const [verificationId, setVerificationId] = useState();
	const [rslver, setRslver] = useState();
	const [verificationCode, setVerificationCode] = useState();
	const [{ user }, action] = useStateValue();
	const history = useHistory();

	const initCaptcha = (error) => {
		window.recaptchaVerifier = new RecaptchaVerifier(
			"recaptcha-container-id",
			{ size: "invisible" },
			auth
		);
	};

	const handleUser = (userCredential) => {
		console.log(userCredential);
		getDoc(doc(db, "users", userCredential.user.uid))
			.then((doc) => {
				console.log(doc.data());
				if (doc.exists()) {
					action({
						type: "SET_USER",
						payload: {
							user: {
								id: doc.id,
								...doc.data(),
							},
						},
					});
					setLoading(false);
					showSuccess("Welcome Back!");
					history.push("/dashboard");
				} else {
					auth.signOut();
					setLoading(false);
					showError("User not found!");
				}
			})
			.catch((e) => {
				console.log(e);
				auth.signOut();
				setLoading(false);
				showError("User not found!");
			});
	};

	const handleConfirm = async (e) => {
		e.preventDefault();
		const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
		const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
		// Complete sign-in.
		rslver
			.resolveSignIn(multiFactorAssertion)
			.then((userCredential) => handleUser(userCredential))
			.catch((e) => {
				console.log(e);
				showError("Something went wrong");
				setLoading(false);
			});
	};

	const initMultiFactor = async (error) => {
		const resolver = getMultiFactorResolver(auth, error);
		// Ask user which second factor to use.
		if (true) {
			const phoneInfoOptions = {
				multiFactorHint: resolver.hints[0],
				session: resolver.session,
			};
			const phoneAuthProvider = new PhoneAuthProvider(auth);
			// Send SMS verification code
			return phoneAuthProvider
				.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier)
				.then(function (vId) {
					showSuccess("Verification code sent!");
					setCodeSent(true);
					setLoading(false);
					setVerificationId(vId);
					setRslver(resolver);
					// Ask user for the SMS verification code. Then:
				})
				.catch((e) => {
					showError("Something went wrong");
					console.log(e);
					setLoading(false);
				});
		} else {
			// Unsupported second factor.
		}
	};

	const handleSubmit = (e) => {
		console.log("Running handleSubmit");
		e.preventDefault();
		setLoading(true);
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				handleUser(userCredential);
			})
			.catch((error) => {
				if (error.code == "auth/multi-factor-auth-required") {
					initCaptcha(error);
					initMultiFactor(error);
				} else if (error.code == "auth/wrong-password") {
					// Handle other errors such as wrong password.
					console.log("error", error);
					showError("Invalid Credentials!");
					setLoading(false);
				} else {
					console.log(error);
					showError("Something went wrong");
					setLoading(false);
				}
			});
	};

	return (
		<div className='full-page-wrapper bg-white'>
			<div className='d-flex align-items-center auth px-0 bg-black'>
				<div className='row w-100 mx-0'>
					<div className='col-lg-4 mx-auto'>
						<div
							style={{
								background: "#89ff57",
								boxShadow: "0px 0px 20px 0px rgba( 0, 0, 0, 0.4 )",
							}}
							className='card text-left py-5 px-4 px-sm-5 '
						>
							<div className=' text-center'>
								<div className='brand-logo'>
									<img
										src={require("../assets/images/LogoRectangle.png")}
										alt='logo'
									/>
								</div>
								<h4>Login</h4>
							</div>
							{/* <h6 className='font-weight-light'>Sign in to continue.</h6> */}
							<Form
								onSubmit={codeSent ? handleConfirm : handleSubmit}
								className='pt-3'
							>
								{codeSent ? (
									<Form.Group className='d-flex search-field'>
										<Form.Control
											type='number'
											placeholder='Enter OTP'
											size='lg'
											className='h-auto auth_input'
											value={verificationCode}
											onChange={(e) => setVerificationCode(e.target.value)}
										/>
									</Form.Group>
								) : (
									<>
										<Form.Group className='d-flex search-field'>
											<Form.Control
												type='email'
												placeholder='E-mail'
												size='lg'
												className='h-auto auth_input'
												value={email}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</Form.Group>
										<Form.Group className='d-flex search-field'>
											<Form.Control
												type='password'
												placeholder='Password'
												size='lg'
												className='h-auto auth_input'
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
										</Form.Group>
									</>
								)}
								<div id='recaptcha-container-id'></div>
								<div className='mt-3'>
									<button
										style={{ color: "black" }}
										className='btn btn-block btn-primary auth-form-btn bg-white text-black br-5'
										type='submit'
										disabled={loading}
									>
										{codeSent ? "Submit" : "Login"}
									</button>
								</div>
								{/* <div className='my-2 d-flex justify-content-between align-items-center'>
										<div className='form-check'>
											<label className='form-check-label text-muted'>
												<input type='checkbox' className='form-check-input' />
												<i className='input-helper'></i>
												Keep me signed in
											</label>
										</div>
										<a
											href='!#'
											onClick={(event) => event.preventDefault()}
											className='auth-link text-muted'
										>
											Forgot password?
										</a>
									</div> */}
								{/* <div className='text-center mt-4 font-weight-light'>
									<Link to='/user-pages/register' className='text-primary'>
										Forgot Password?
									</Link>
								</div> */}
							</Form>
							<h5 className='mt-5 text-center'>
								Tech Support +1 (832) 388-3526
							</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
