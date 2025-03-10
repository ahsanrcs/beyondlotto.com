import {
	createUserWithEmailAndPassword,
	updateCurrentUser,
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
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { auth2, db } from "../../firebase";
import { subscriptions } from "../../utils/constants";
import { showError, showSuccess } from "../../utils/functions";
import Spin from "../../utils/Spin";
import moment from "moment";

const initialState = {
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
	phone: "",
	address: "",
	is_paid_user: false,
	subscription_date: null,
	is_blocked: false,
	role: "user",
	last_login: null,
	login_status: false,
	device: null,
	created_at: null,
	updated_at: null,
	screen1: {
		total_boxes: 18,
		empty_box: null,
		empty_box_custom_image: null,
		array_for_boxes: [],
		show_header: true,
		orientation: "landscape",
	},
	screen2: {
		total_boxes: 18,
		empty_box: null,
		empty_box_custom_image: null,
		array_for_boxes: [],
		show_header: true,
		orientation: "landscape",
	},
	company_name: "",
	store_name: "",
	location_phone: "",
	contact_person_location: "",
	contact_person_phone: "",
	owner_name: "",
	owner_phone: "",
	store_email: "",
	store_address: "",
	account_type: "basic",
	subscription_expires: moment().format("YYYY-MM-DD"),
};

const BasicElements = (props) => {
	const [formData, setFormData] = useState(initialState);
	const [isEdit, setIsEdit] = useState(false);
	const [loading, setLoading] = useState(false);
	const history = useHistory();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.name === "") {
			showError("Name is required");
			return;
		}
		if (formData.email === "") {
			showError("Email is required");
			return;
		}
		if (formData.password === "") {
			showError("Password is required");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			showError("Password and Confirm Password must be same");
			return;
		}

		if (formData.password.length <= 5) {
			showError("Password must be 6 characters long");
			return;
		}

		const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		if (!emailRegex.test(formData.email)) {
			showError("Please enter a valid email address");
			return;
		}

		const email = formData.email;
		const password = formData.password;

		const newData = { ...formData };
		newData.created_at = new Date();
		newData.updated_at = new Date();

		delete newData.password;
		delete newData.confirmPassword;

		setLoading(true);

		createUserWithEmailAndPassword(auth2, email, password)
			.then((userCredential) => {
				setDoc(doc(db, "users", userCredential.user.uid), newData)
					.then((d) => {
						updateProfile(auth2.currentUser, {
							displayName: formData.name,
						})
							.then(() => {
								auth2.signOut();
								setFormData(initialState);
								setLoading(false);
								showSuccess("User added successfully");
								history.push("/users");
							})
							.catch((updateErr) => {
								console.log(updateErr);
								setLoading(false);
							});
					})
					.catch((err) => {
						console.log(err);
						setLoading(false);
						showError("Something went wrong");
					});
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Something went wrong");
			});
	};

	useEffect(() => {
		const id = history.location.search.split("=")[1];
		if (id != 0) {
			setLoading(true);
			getDoc(doc(db, "users", id))
				.then((d) => {
					console.log(d.data());
					setFormData(d.data());
					setIsEdit(true);
					setLoading(false);
				})
				.catch((err) => {
					setLoading(false);
					showError("Something went wrong!");
					console.log(err);
				});
		}
	}, []);

	const handleUpdate = (e) => {
		e.preventDefault();
		const id = history.location.search.split("=")[1];
		if (id != 0) {
			const newData = { ...formData };
			if (newData.password) {
				if (formData.password.length <= 5) {
					showError("Password must be 6 characters long");
					return;
				}

				if (newData.password !== newData.confirmPassword) {
					showError("Passwords do not match");
					return;
				}
				setLoading(true);
				fetch(process.env.REACT_APP_SERVER_URL + "/changePassword", {
					method: "POST",
					body: JSON.stringify({ id: id, pass: newData.password }),
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res);
						if (res.result) {
							showSuccess(res.message);
							newData.updated_at = new Date();
							delete newData.password;
							delete newData.confirmPassword;
							updateDoc(doc(db, "users", id), newData)
								.then((d) => {
									setLoading(false);
									showSuccess("User updated successfully");
									history.push("/users");
								})
								.catch((err) => {
									setLoading(false);
									showError("Something went wrong!");
									console.log(err);
								});
						} else {
							showError(res.message);
							setLoading(false);
						}
					})
					.catch((e) => {
						showError("Something went wrong");
						setLoading(false);
						console.log(e);
					});
			} else {
				newData.updated_at = new Date();
				delete newData.password;
				delete newData.confirmPassword;
				setLoading(true);
				updateDoc(doc(db, "users", id), newData)
					.then((d) => {
						setLoading(false);
						showSuccess("User updated successfully");
						history.push("/users");
					})
					.catch((err) => {
						setLoading(false);
						showError("Something went wrong!");
						console.log(err);
					});
			}
		}
	};

	return (
		<div>
			<Spin spinning={loading} />
			<div className='row center'>
				<div className='col-md-12 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>
								{isEdit ? "Edit User Details" : "Create New User"}
							</h4>
							<p className='card-description'>
								{" "}
								Please fill out all the information{" "}
							</p>
							<form
								autoComplete='off'
								onSubmit={handleSubmit}
								className='forms-sample'
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
											// style={{
											// 	backgroundColor: `${isEdit ? "black" : null}`,
											// }}
											disabled={isEdit}
											value={formData.email}
											type='email'
											className='form-control bg-white'
											id='exampleInputEmail2'
											placeholder='Email'
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
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
											value={formData.password}
											type='password'
											className='form-control'
											id='exampleInputPassword2'
											placeholder='Password'
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
										Confirm Password
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.confirmPassword}
											type='password'
											className='form-control'
											id='exampleInputConfirmPassword2'
											placeholder='Password'
											onChange={(e) =>
												setFormData({
													...formData,
													confirmPassword: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Company's Name
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.company_name}
											type='text'
											className='form-control'
											placeholder="Company's Name"
											onChange={(e) =>
												setFormData({
													...formData,
													company_name: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Store Name
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.store_name}
											type='text'
											className='form-control'
											placeholder='Store Name'
											onChange={(e) =>
												setFormData({ ...formData, store_name: e.target.value })
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Location Phone
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.location_phone}
											type='text'
											className='form-control'
											placeholder='Mobile Number'
											onChange={(e) =>
												setFormData({
													...formData,
													location_phone: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Contact Person at Location
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.contact_person_location}
											type='text'
											className='form-control'
											placeholder='Location'
											onChange={(e) =>
												setFormData({
													...formData,
													contact_person_location: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Contact Person Cell Number
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.contact_person_phone}
											type='text'
											className='form-control'
											placeholder='Mobile Number'
											onChange={(e) =>
												setFormData({
													...formData,
													contact_person_phone: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Owner Name
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.owner_name}
											type='text'
											className='form-control'
											placeholder='Owner Name'
											onChange={(e) =>
												setFormData({
													...formData,
													owner_name: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Owner's Cell Phone
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.owner_phone}
											type='text'
											className='form-control'
											placeholder="Owner's cell phone"
											onChange={(e) =>
												setFormData({
													...formData,
													owner_phone: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Store Email Address
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.store_email}
											type='email'
											className='form-control'
											placeholder='Email'
											onChange={(e) =>
												setFormData({
													...formData,
													store_email: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Store Address
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.store_address}
											type='text'
											className='form-control'
											placeholder='Store Address'
											onChange={(e) =>
												setFormData({
													...formData,
													store_address: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Account Type
									</label>
									<div className='col-sm-9'>
										<select
											value={formData.account_type}
											className='form-control'
											id='exampleSelectGender'
											onChange={(e) =>
												setFormData({
													...formData,
													account_type: e.target.value,
												})
											}
										>
											{subscriptions.map((sub) => (
												<option value={sub.name}>{sub.label}</option>
											))}
										</select>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Subscription Expires
									</label>
									<div className='col-sm-9'>
										<input
											type='date'
											value={formData.subscription_expires}
											className='form-control'
											id='exampleSelectGender'
											onChange={(e) =>
												setFormData({
													...formData,
													subscription_expires: e.target.value,
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
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									></label>
									<div className='col-sm-9'>
										<button
											onClick={isEdit ? handleUpdate : handleSubmit}
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
					</div>
				</div>
			</div>
		</div>
	);
};

export default BasicElements;
