import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateCurrentUser,
	// updateEmail,
	updatePassword,
	updateProfile,
} from "firebase/auth";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { useHistory, useLocation, useParams } from "react-router-dom";
import EnableTwoFactor from "../../Components/EnableTwoFactor";
import { auth, auth2, db } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import Spin from "../../utils/Spin";

const initialState = {
	name: "",
	email: "",
	oldPassword: "",
	password: "",
	confirmPassword: "",
	phone: "",
	address: "",
	is_paid_user: false,
	subscription_date: null,
	is_blocked: false,
	role: "user",
	last_login: null,
	total_boxes: 50,
	login_status: false,
	device: null,
	empty_box: 0,
	empty_box_custom_image: null,
	array_for_boxes: [],
	created_at: null,
	updated_at: null,
};

const Profile = (props) => {
	const [formData, setFormData] = useState(initialState);
	const [prevData, setPrevData] = useState({});
	const [isEdit, setIsEdit] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const history = useHistory();

	// useEffect(() => {
	// 	const id = history.location.search.split("=")[1];
	// 	if (id != 0) {
	// 		setLoading(true);
	// 		getDoc(doc(db, "users", id))
	// 			.then((d) => {
	// 				console.log(d.data());
	// 				setFormData(d.data());
	// 				setIsEdit(true);
	// 				setLoading(false);
	// 			})
	// 			.catch((err) => {
	// 				setLoading(false);
	// 				showError("Something went wrong!");
	// 				console.log(err);
	// 			});
	// 	}
	// }, []);

	const handleUpdate = (e) => {
		e.preventDefault();
		setLoading(true);
		const newData = { ...formData };

		// if (formData.email !== prevData.email) {
		// 	if (!formData.oldPassword) {
		// 		setLoading(false);
		// 		showError("Please provide your password to change email");
		// 		return;
		// 	}
		// 	signInWithEmailAndPassword(
		// 		auth,
		// 		prevData.email,
		// 		formData.oldPassword
		// 	).then((d) => {
		// 		updateEmail(auth.currentUser, formData.email)
		// 			.then((res) => {
		// 				console.log(res);
		// 			})
		// 			.catch((err) => {
		// 				console.log(err);
		// 				setLoading(false);
		// 				showError("Something went wrong!");
		// 				return;
		// 			});
		// 	});
		// }

		if (formData.password) {
			if (formData.password !== formData.confirmPassword) {
				setLoading(false);
				showError("New Password and Confirm Password must be same");
				return;
			}
			if (formData.password.length <= 5) {
				setLoading(false);
				showError("New Password must be 6 characters long");
				return;
			}
			signInWithEmailAndPassword(
				auth,
				formData.email,
				formData.oldPassword
			).then((d) => {
				updatePassword(auth.currentUser, formData.password)
					.then((res) => {
						console.log(res);
					})
					.catch((err) => {
						console.log(err);
						setLoading(false);
						showError("Something went wrong!");
						return;
					});
			});
		}

		if (formData.name !== prevData.name) {
			updateProfile(auth.currentUser, {
				displayName: formData.name,
			})
				.then(() => {
					console.log("updated");
				})
				.catch((err) => {
					console.log(err);
					setLoading(false);
					showError("Something went wrong!");
					return;
				});
		}

		delete newData.password;
		delete newData.confirmPassword;
		delete newData.oldPassword;

		newData.updated_at = new Date();

		updateDoc(doc(db, "users", auth.currentUser.uid), newData)
			.then((d) => {
				setLoading(false);
				showSuccess("User updated successfully");
				setFormData(initialState);
				fetchUser();
			})
			.catch((err) => {
				setLoading(false);
				showError("Something went wrong!");
				console.log(err);
			});
	};

	const fetchUser = () => {
		setLoading(true);
		getDoc(doc(db, "users", auth.currentUser.uid))
			.then((d) => {
				if (d.exists()) {
					setFormData(d.data());
					setPrevData(d.data());
					setLoading(false);
				} else {
					setLoading(false);
					showError("User Data Not Found");
				}
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Something went wrong!");
			});
	};

	useEffect(fetchUser, []);
	return (
		<div>
			<Spin spinning={loading} />
			<div className='row center'>
				<div className='col-md-5 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body d-flex flex-column  align-items-center'>
							<h4 className='card-title'>Accout Details</h4>
							<div
								className='border d-flex justify-content-center align-items-center pr-4 pl-4'
								alt='Avatar'
							>
								<i
									style={{ fontSize: "8em" }}
									class='mdi mdi-account text-primary'
								></i>
							</div>
							<div
								style={{ width: "100%" }}
								className='bg-white py-3 px-4 px-md-3 px-xl-4  mt-3'
							>
								<div
									style={{ gap: "30px" }}
									className=' text-xl-left d-flex align-items-center'
								>
									<div className='preview-thumbnail '>
										<div className='preview-icon bg-info pt-2 pb-2 pl-3 pr-3 '>
											<i
												style={{ fontSize: "1.3rem" }}
												className='mdi mdi-clock'
											/>
										</div>
									</div>
									<div>
										<h6 className='mb-1'>Member Since</h6>
										<p className='text-muted mb-0'>
											{formData.created_at
												? moment
														.unix(formData?.created_at?.seconds)
														.format("MMM DD, YYYY")
												: "N/A"}
										</p>
									</div>
								</div>
							</div>
							<div
								style={{ width: "100%" }}
								className='bg-white py-3 px-4 px-md-3 px-xl-4  mt-3'
							>
								<div
									style={{ gap: "30px" }}
									className='text-xl-left d-flex align-items-center'
								>
									<div className='preview-thumbnail'>
										<div className='preview-icon bg-primary pt-2 pb-2 pl-3 pr-3'>
											<i
												style={{ fontSize: "1.3rem" }}
												className='mdi mdi-account-check'
											/>
										</div>
									</div>
									<div>
										<h6 className='mb-1'>Subscribed</h6>
										<p className='text-muted mb-0'>
											{formData.is_paid_user ? "Yes" : "No"}
										</p>
									</div>
								</div>
							</div>
							<div
								style={{ width: "100%" }}
								className='bg-white py-3 px-4 px-md-3 px-xl-4  mt-3'
							>
								<div
									style={{ gap: "30px" }}
									className='text-xl-left d-flex align-items-center'
								>
									<div className='preview-thumbnail'>
										<div className='preview-icon bg-danger pt-2 pb-2 pl-3 pr-3'>
											<i
												style={{ fontSize: "1.3rem" }}
												className='mdi mdi-timetable'
											/>
										</div>
									</div>
									<div>
										<h6 className='mb-1'>Next Subscription Date</h6>
										<p className='text-muted mb-0'>
											{formData.subscription_expires}
										</p>
									</div>
								</div>
							</div>
							<div
								style={{ width: "100%" }}
								className='bg-white py-3 px-4 px-md-3 px-xl-4  mt-3'
							>
								<div
									style={{ gap: "30px" }}
									className='text-xl-left d-flex align-items-center'
								>
									<div className='preview-thumbnail'>
										<div className='preview-icon bg-success pt-2 pb-2 pl-3 pr-3'>
											<i
												style={{ fontSize: "1.3rem" }}
												className='mdi mdi-account-key'
											/>
										</div>
									</div>
									<div>
										<h6 className='mb-1'>Account Active</h6>
										<p className='text-muted mb-0'>
											{formData.login_status ? "Yes" : "No"}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='col-md-7 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>Update Profile</h4>
							<p className='card-description mb-4'>
								{" "}
								Please fill out all the information below
							</p>
							<form
								style={{ justifyContent: "space-between", height: "80%" }}
								autoComplete='off'
								onSubmit={handleUpdate}
								className='forms-sample d-flex flex-column'
							>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Full Name
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.name}
											type='text'
											className='form-control'
											id='exampleInputUsername2'
											placeholder='Name'
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Phone
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.phone}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Mobile number'
											onChange={(e) =>
												setFormData({ ...formData, phone: e.target.value })
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Email
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.email}
											type='email'
											className='form-control'
											id='exampleInputEmail2'
											placeholder='Email'
											disabled   // 🔒 this prevents editing
      readOnly   // optional, just to be safey
											// onChange={(e) =>
											// 	setFormData({ ...formData, email: e.target.value })
											// }
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Address
									</label>
									<div className='col-sm-9'>
										<textarea
											value={formData.address}
											className='form-control'
											id='exampleTextarea1'
											rows='4'
											placeholder='Address'
											onChange={(e) =>
												setFormData({ ...formData, address: e.target.value })
											}
										></textarea>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputPassword2'
										className='col-sm-3 col-form-label'
									>
										Password
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.oldPassword}
											type='password'
											className='form-control'
											id='exampleInputPassword2'
											placeholder='Password'
											onChange={(e) =>
												setFormData({
													...formData,
													oldPassword: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputPassword2'
										className='col-sm-3 col-form-label'
									>
										New Password
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.password}
											type='password'
											className='form-control'
											id='exampleInputPassword2'
											placeholder='New Password'
											onChange={(e) =>
												setFormData({
													...formData,
													password: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputConfirmPassword2'
										className='col-sm-3 col-form-label'
									>
										Confirm New Password
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.confirmPassword}
											type='password'
											className='form-control'
											id='exampleInputConfirmPassword2'
											placeholder='Confirm Password'
											onChange={(e) =>
												setFormData({
													...formData,
													confirmPassword: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<div className='row mb-4'>
									<label className='col-sm-3 col-form-label'></label>
									<div
										onClick={() => setShowModal(true)}
										className='btn btn-primary col-sm-6 ml-2 p-2'
									>
										Enable two factor authectication
									</div>
								</div>
								{/* <Form.Group className='row'>
									<label
										htmlFor='exampleInputConfirmPassword2'
										className='col-sm-3 col-form-label'
									>
										Role
									</label>
									<div className='col-sm-9'>
										<Form.Group className='row ml-2'>
											<div className='form-check mr-5'>
												<label className='form-check-label'>
													<input
														type='radio'
														className='form-check-input'
														name='optionsRadios'
														id='optionsRadios1'
														value='user'
														checked={formData.role === "user"}
														onChange={(e) =>
															setFormData({ ...formData, role: e.target.value })
														}
													/>
													<i className='input-helper'></i>
													User
												</label>
											</div>
											<div className='form-check'>
												<label className='form-check-label'>
													<input
														type='radio'
														className='form-check-input'
														name='optionsRadios'
														id='optionsRadios2'
														value='admin'
														checked={formData.role === "admin"}
														onChange={(e) =>
															setFormData({ ...formData, role: e.target.value })
														}
													/>
													<i className='input-helper'></i>
													Admin
												</label>
											</div>
										</Form.Group>
									</div>
								</Form.Group> */}

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									></label>
									<div className='col-sm-9'>
										<button
											onClick={handleUpdate}
											type='submit'
											className='btn btn-primary mr-2 pl-5 pr-5'
										>
											Save
										</button>
										<button
											onClick={(e) => {
												e.preventDefault();
												setFormData(initialState);
												history.push("/users");
											}}
											className='btn btn-dark pl-5 pr-5'
										>
											Cancel
										</button>
									</div>
								</Form.Group>
							</form>
						</div>
						<Modal show={showModal} onHide={() => setShowModal(false)} centered>
							<Modal.Header
								closeButton
								style={{ background: "white", color: "black" }}
							>
								<Modal.Title>
									<div className='text-center'>
										Enable two factor authentication
									</div>
								</Modal.Title>
							</Modal.Header>
							<div
								style={{
									background: "white",
									color: "black",
									textAlign: "center",
									padding: "1rem 3rem",
									fontSize: "1.5rem",
								}}
							>
								<EnableTwoFactor
									setShowModal={setShowModal}
									setLoading={setLoading}
								/>
							</div>
						</Modal>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
