import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { auth, db, storage } from "../firebase";
import { useStateValue } from "../State/Stateprovider";
import { subscriptions } from "../utils/constants";
import { showError, showSuccess } from "../utils/functions";
import Spin from "../utils/Spin";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const initialState = {
	show_header: true,
	total_boxes: "",
	empty_box: "",
	empty_box_custom_image: null,
};

const SettingsScreen = ({ data, screen, fetchUserData }) => {
	const [formData, setFormData] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [sub, setSub] = useState();
	const [{ user }] = useStateValue();

	useEffect(() => {
		if (data) {
			const show_header = data.show_header === undefined ? true : data.show_header;

			setFormData({ ...data, show_header });
		}
	}, [data, screen]);

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);

		const newData = { ...formData };

		updateDoc(doc(db, "users", auth.currentUser.uid), {
			["screen" + screen]: {
				...data,
				...newData,
			},
		})
			.then((d) => {
				fetchUserData();
				setLoading(false);
				showSuccess("Settings successfully updated");
			})
			.catch((err) => {
				console.log(err);
				showError("Something went wrong!");
				setLoading(false);
			});
	};

	const handleUpload = (e) => {
		e.preventDefault();
		setLoading(true);
		const el = document.getElementById("custom_upload");
		console.log(el.files);
		const imagesRef = ref(storage, `/Custom Images/${new Date().getTime() + el.files[0].name}`);
		uploadBytes(imagesRef, el.files[0])
			.then((snapshot) => {
				console.log("Uploaded a blob or file!");
				console.log(snapshot);
				getDownloadURL(snapshot.ref)
					.then((url) => {
						console.log(url);
						setFormData({ ...formData, empty_box_custom_image: url });
						setLoading(false);
						showSuccess("Image uploaded successfully");
					})
					.catch(() => {
						showError("Something went wrong!");
						setLoading(false);
					});
			})
			.catch((e) => {
				console.log(e);
				setLoading(false);
			});
	};

	useEffect(() => {
		if (user) {
			const acc = user.account_type || "basic";
			setSub(subscriptions.filter((a) => a.name === acc)[0]);
		}
	}, [user]);

	console.log(formData);

	return (
		<div>
			<Spin spinning={loading} />
			<div className='row center'>
				<div className='col-md-12 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>Global Settings</h4>
							<p className='card-description'> Please fill out all the information </p>
							{/* <form onSubmit={handleSubmit} className='forms-sample'> */}
							<Form.Group className='row d-flex'>
								{sub && sub.live && (
									<div className='form-check text-white'>
										<label
											style={{
												marginLeft: "-0.4rem",
												width: "75vw",
												color: "black",
											}}
											className='col-sm-12 form-check-label'
										>
											<input
												checked={formData.show_header}
												type='checkbox'
												className='form-check-input'
												onChange={(e) => {
													setFormData({
														...formData,
														show_header: e.target.checked,
													});
												}}
											/>
											<i className='input-helper ml-3'></i>
											Show Game Information Header on TV?
										</label>
									</div>
								)}
								<label htmlFor='exampleInputConfirmPassword2' className='col-sm-12 col-form-label mt-1'>
									Lottery Tickets To Show
								</label>

								<div className=''>
									<Form.Group className='col'>
										<label
											style={{ gap: "10px", fontSize: "1.1rem", marginTop: "12px" }}
											className='d-flex center form-check-label'
										>
											<Slider
												style={{ minWidth: "200px" }}
												min={18}
												max={100}
												step={1}
												value={formData.total_boxes}
												onChange={(v) => {
													setFormData({
														...formData,
														total_boxes: parseInt(v),
													});
												}}
												styles={{
													rail: {
														background: "rgba(0,0,0,0.1)",
													},
													track: {
														background: "#0090e7",
													},
													handle: {
														background: "#0090e7",
														borderColor: "#0090e7",
													},
												}}
											/>
											{formData.total_boxes}
										</label>
									</Form.Group>
								</div>
							</Form.Group>
							<Form.Group className='row d-flex'>
								<label htmlFor='exampleInputConfirmPassword2' className='col-sm-12 col-form-label mt-1'>
									What to show in box when lottery ticket is not selected
								</label>
								<div className=''>
									<Form.Group className='col'>
										<div className='form-check mr-5'>
											<label className='form-check-label'>
												<input
													type='radio'
													className='form-check-input'
													name='empty_box_custom_image'
													id='options1'
													value={null}
													checked={formData.empty_box === null}
													onChange={(e) =>
														setFormData({
															...formData,
															empty_box: e.target.value || null,
														})
													}
												/>
												<i className='input-helper'></i>
												Empty
											</label>
										</div>
										<div className='form-check mr-5'>
											<label className='form-check-label'>
												<input
													type='radio'
													className='form-check-input'
													name='empty_box_custom_image'
													id='options2'
													value='Coming Soon'
													checked={formData.empty_box === "Coming Soon"}
													onChange={(e) =>
														setFormData({
															...formData,
															empty_box: e.target.value,
														})
													}
												/>
												<i className='input-helper'></i>
												Coming Soon
											</label>
										</div>
										<div className='form-check mr-5'>
											<label className='form-check-label'>
												<input
													type='radio'
													className='form-check-input'
													name='empty_box_custom_image'
													id='options3'
													value='Custom'
													checked={formData.empty_box === "Custom"}
													onChange={(e) =>
														setFormData({
															...formData,
															empty_box: e.target.value,
														})
													}
												/>
												<i className='input-helper'></i>
												Custom
											</label>
										</div>
									</Form.Group>
								</div>
							</Form.Group>
							{formData.empty_box === "Custom" && (
								<Form.Group className='row'>
									<label htmlFor='exampleInputEmail2' className='ml-4 col-form-label'></label>
									<div className='col-sm-2 d-flex'>
										<button
											style={{
												width: "100%",
												cursor: "pointer",
												minWidth: "max-content",
												fontSize: "0.8rem",
											}}
											type='button'
											class='btn btn-primary btn-icon-text'
										>
											<i class='mdi mdi-upload btn-icon-prepend'></i>Upload Custom Image
											<input
												id='custom_upload'
												style={{
													position: "absolute",
													top: 0,
													left: 0,
													width: "100%",
													height: "100%",
													cursor: "pointer",
												}}
												onChange={(e) => {
													handleUpload(e);
												}}
												className='custom-file-input'
												type='file'
											/>
										</button>
										{formData.empty_box_custom_image && (
											<i style={{ fontSize: "1.5rem" }} className='ml-3 text-success mdi mdi-checkbox-marked-circle' />
										)}
									</div>
								</Form.Group>
							)}
							{formData.empty_box === "Custom" && formData.empty_box_custom_image && (
								<Form.Group className='row'>
									<label htmlFor='exampleInputEmail2' className='ml-4 col-form-label'></label>
									<div className='col-sm-3 d-flex'>
										{formData.empty_box_custom_image && (
											<img
												style={{
													height: "100%",
													width: "100%",
													objectFit: "cover",
												}}
												src={formData.empty_box_custom_image}
											/>
										)}
									</div>
								</Form.Group>
							)}
							<div className='row ml-3 col-form-label'></div>
							<Form.Group className='row row d-flex'>
								<label htmlFor='exampleInputMobile' className='col-sm-12 col-form-label'></label>
								<div className='mt-3 col-sm-4'>
									<button
										style={{ width: "100%", maxWidth: "250px" }}
										onClick={handleSubmit}
										type='submit'
										className='btn btn-success pl-5 pr-5'
									>
										Save Settings
									</button>
								</div>
							</Form.Group>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsScreen;
