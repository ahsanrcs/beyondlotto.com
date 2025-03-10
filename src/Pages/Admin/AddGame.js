import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { db, storage } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Spin from "../../utils/Spin";

const initialState = {
	number: "",
	ticket_value: "",
	description: "",
	is_active: true,
	image_url: "",
};

const AddGame = () => {
	const [formData, setFormData] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const history = useHistory();

	const handleSubmit = (e) => {
		e.preventDefault();

		if (formData.image_url === "") {
			showError("Please upload an image");
			return;
		}
		setLoading(true);
		const newData = { ...formData };
		newData.created_at = new Date();

		addDoc(collection(db, "games"), newData)
			.then((d) => {
				setFormData(initialState);
				showSuccess("Game added successfully");
				setLoading(false);
				history.push("/games");
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Something went wrong!");
			});
	};

	useEffect(() => {
		const id = history.location.search.split("=")[1];
		if (id != 0) {
			setLoading(true);
			getDoc(doc(db, "games", id))
				.then((d) => {
					console.log(d.data());
					setFormData(d.data());
					setIsEdit(true);
					setLoading(false);
				})
				.catch((err) => {
					showError("Something went wrong!");
					console.log(err);
					setLoading(false);
				});
		}
	}, []);

	const handleUpdate = (e) => {
		e.preventDefault();

		if (formData.image_url === "") {
			showError("Please upload an image");
			return;
		}
		setLoading(true);
		const id = history.location.search.split("=")[1];
		if (id != 0) {
			const newData = { ...formData };
			newData.updated_at = new Date();
			updateDoc(doc(db, "games", id), newData)
				.then((d) => {
					showSuccess("Game updated successfully");
					history.push("/games");
					setLoading(false);
				})
				.catch((err) => {
					showError("Something went wrong!");
					console.log(err);
					setLoading(false);
				});
		}
	};

	const handleUpload = (e) => {
		e.preventDefault();
		setLoading(true);
		const el = document.getElementById("upload");
		console.log(el.files);
		const imagesRef = ref(
			storage,
			`/Game Thumbnails/${new Date().getTime() + el.files[0].name}`
		);
		uploadBytes(imagesRef, el.files[0])
			.then((snapshot) => {
				console.log("Uploaded a blob or file!");
				console.log(snapshot);
				getDownloadURL(snapshot.ref)
					.then((url) => {
						setFormData({ ...formData, image_url: url });
						console.log(url);
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

	console.log(formData);

	return (
		<div>
			<Spin spinning={loading} />
			<div className='row center'>
				<div className='col-md-12 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>
								{isEdit ? "Edit Game Details" : "Create New Game"}
							</h4>
							<p className='card-description'>
								{" "}
								Please fill out all the information{" "}
							</p>
							<form onSubmit={handleSubmit} className='forms-sample'>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputUsername2'
										className='col-sm-3 col-form-label'
									>
										Game Number
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.number}
											type='number'
											className='form-control'
											id='exampleInputUsername2'
											placeholder='Number'
											onChange={(e) =>
												setFormData({ ...formData, number: e.target.value })
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Game Value
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.ticket_value}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Value'
											onChange={(e) =>
												setFormData({
													...formData,
													ticket_value: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Deatils
									</label>
									<div className='col-sm-9'>
										<textarea
											value={formData.description}
											className='form-control'
											id='exampleTextarea1'
											rows='4'
											placeholder='Details'
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
										></textarea>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									>
										Thumbnail
									</label>
									<div className='col-sm-2 d-flex'>
										<button
											style={{
												width: "100%",
												cursor: "pointer",
												minWidth: "max-content",
											}}
											type='button'
											class='btn btn-success btn-icon-text'
										>
											<i class='mdi mdi-upload btn-icon-prepend'></i>Upload
											<input
												id='upload'
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
										{formData.image_url && (
											<i
												style={{ fontSize: "1.5rem" }}
												className='ml-3 text-success mdi mdi-checkbox-marked-circle'
											/>
										)}
									</div>
								</Form.Group>

								<Form.Group className='row'>
									<label
										htmlFor='exampleInputEmail2'
										className='col-sm-3 col-form-label'
									></label>
									<div className=' col-sm-2 d-flex mt-5'>
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
												history.push("/games");
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

export default AddGame;
