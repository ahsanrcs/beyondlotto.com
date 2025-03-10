import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { db } from "../../firebase";
import { showError } from "../../utils/functions";
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
	company_name: "",
	store_name: "",
	location_phone: "",
	contact_person_location: "",
	contact_person_phone: "",
	owner_name: "",
	owner_phone: "",
	store_email: "",
	store_address: "",
	account_type: "free",
};

const Profile = (props) => {
	const [formData, setFormData] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const history = useHistory();

	const fetchUser = () => {
		setLoading(true);
		const id = history.location.search.split("=")[1];
		getDoc(doc(db, "users", id))
			.then((d) => {
				if (d.exists()) {
					setFormData(d.data());
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
									className='text-xl-left d-flex align-items-center'
								>
									<div className='preview-thumbnail'>
										<div className='preview-icon bg-info pt-2 pb-2 pl-3 pr-3'>
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
											{formData.subscription_date
												? moment
														.unix(formData.subscription_date.seconds)
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
						<div className='bg-white text-center px-2 py-2 my-3 mx-4 mx-md-3 mx-xl-4'>
							Screen 1
						</div>
						<div className='my-3 mx-4 mx-md-3 mx-xl-4  mt-3'>
							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Total Boxes
								</label>
								<div className='col-sm-9'>
									<Form.Control
										disabled
										value={parseInt(formData.screen1?.total_boxes) || 0}
										type='number'
										className='form-control bg-white'
										id='total_boxes'
										placeholder='Total Boxes'
									/>
								</div>
							</Form.Group>

							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Empty Box
								</label>
								<div className='col-sm-9'>
									<Form.Control
										disabled
										value={formData.screen1?.empty_box}
										type='text'
										className='form-control bg-white'
										id='empty_boxes'
										placeholder='Empty Boxes'
									/>
								</div>
							</Form.Group>

							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Custom Image
								</label>
								{formData.screen1?.empty_box_custom_image ? (
									formData.screen1?.empty_box_custom_image === "Coming Soon" ? (
										<div className='col-sm-9'>
											<Form.Control
												disabled
												value='Coming Soon'
												type='text'
												className='form-control bg-white'
												id='is_blocked'
												placeholder='Block Status'
											/>
										</div>
									) : (
										<div className='col-sm-9'>
											<img
												className='w-100 h-100'
												src={formData.screen1?.empty_box_custom_image}
												alt='custom_image'
											/>
										</div>
									)
								) : (
									<div className='col-sm-9'>
										<Form.Control
											disabled
											value={"N/A"}
											type='text'
											className='form-control bg-white'
											id='is_blocked'
											placeholder='Block Status'
										/>
									</div>
								)}
							</Form.Group>
						</div>
						<div className='bg-white text-center px-2 py-2 my-3 mx-4 mx-md-3 mx-xl-4'>
							Screen 2
						</div>
						<div className='my-3 mx-4 mx-md-3 mx-xl-4  mt-3'>
							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Total Boxes
								</label>
								<div className='col-sm-9'>
									<Form.Control
										disabled
										value={parseInt(formData.screen2?.total_boxes) || 0}
										type='number'
										className='form-control bg-white'
										id='total_boxes'
										placeholder='Total Boxes'
									/>
								</div>
							</Form.Group>

							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Empty Box
								</label>
								<div className='col-sm-9'>
									<Form.Control
										disabled
										value={formData.screen2?.empty_box}
										type='text'
										className='form-control bg-white'
										id='empty_boxes'
										placeholder='Empty Boxes'
									/>
								</div>
							</Form.Group>

							<Form.Group className='row'>
								<label
									htmlFor='exampleInputEmail2'
									className='col-sm-3 col-form-label'
								>
									Custom Image
								</label>
								{formData.screen2?.empty_box_custom_image ? (
									formData.screen2?.empty_box_custom_image === "Coming Soon" ? (
										<div className='col-sm-9'>
											<Form.Control
												disabled
												value='Coming Soon'
												type='text'
												className='form-control bg-white'
												id='is_blocked'
												placeholder='Block Status'
											/>
										</div>
									) : (
										<div className='col-sm-9'>
											<img
												className='w-100 h-100'
												src={formData.screen2?.empty_box_custom_image}
												alt='custom_image'
											/>
										</div>
									)
								) : (
									<div className='col-sm-9'>
										<Form.Control
											disabled
											value={"N/A"}
											type='text'
											className='form-control bg-white'
											id='is_blocked'
											placeholder='Block Status'
										/>
									</div>
								)}
							</Form.Group>
						</div>
					</div>
				</div>
				<div className='col-md-7 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>Profile Information</h4>
							{/* <p className='card-description mb-4'>
								{" "}
								Please fill out all the information below
							</p> */}
							<form
								// style={{ justifyContent: "space-between", height: "80%" }}
								autoComplete='off'
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
											disabled
											value={formData.name || "N/A"}
											type='text'
											className='form-control bg-white'
											id='exampleInputUsername2'
											placeholder='Name'
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
											disabled
											value={formData.phone || "N/A"}
											type='text'
											className='form-control bg-white'
											id='exampleInputMobile'
											placeholder='Mobile number'
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
											disabled
											value={formData.email}
											type='email'
											className='form-control bg-white'
											id='exampleInputEmail2'
											placeholder='Email'
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
											disabled
											value={formData.address || "N/A"}
											className='form-control bg-white'
											id='exampleTextarea1'
											rows='4'
											placeholder='Address'
										></textarea>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Device
									</label>
									<div className='col-sm-9'>
										<Form.Control
											disabled
											value={formData.device || "N/A"}
											type='text'
											className='form-control bg-white'
											id='exampleInputdevice2'
											placeholder='Device'
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
										Blocked
									</label>
									<div className='col-sm-9'>
										<Form.Control
											disabled
											value={parseInt(formData.is_blocked) ? "Yes" : "No"}
											type='text'
											className='form-control bg-white'
											id='is_blocked'
											placeholder='Block Status'
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
											disabled
											value={formData.company_name}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.store_name}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.location_phone}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.contact_person_location}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.contact_person_phone}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.owner_name}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.owner_phone}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.store_email}
											type='email'
											className='form-control bg-white'
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
											disabled
											value={formData.store_address}
											type='text'
											className='form-control bg-white'
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
											disabled
											value={formData.account_type}
											className='form-control bg-white'
											id='exampleSelectGender'
											onChange={(e) =>
												setFormData({
													...formData,
													account_type: e.target.value,
												})
											}
										>
											<option value='free'>Free</option>
											<option value='standard'>Standard</option>
											<option value='premium'>Premium</option>
										</select>
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Last Login
									</label>
									<div className='col-sm-9'>
										<Form.Control
											disabled
											value={
												formData.last_login
													? moment
															.unix(formData.last_login?.seconds || null)
															.format("DD-MM-YYYY HH:mm:ss")
													: "N/A"
											}
											type='text'
											className='form-control bg-white'
											id='last_login'
											placeholder='Last Login'
										/>
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

export default Profile;
