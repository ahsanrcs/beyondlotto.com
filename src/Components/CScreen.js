import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { auth, db, storage } from "../firebase";
import { showError, showSuccess } from "../utils/functions";
import Spin from "../utils/Spin";

const initialState = {
	media_type: "",
	media_url: "",
	orientation: "landscape",
};

const CScreen = ({ data, screen, fetchUserGames }) => {
	const [formData, setFormData] = useState(initialState);
	const [loading, setLoading] = useState(false);

	const handleUpload = (e) => {
		e.preventDefault();
		setLoading(true);
		const el = document.getElementById("screen_file_upload");
		const fileType = el.files[0].type.split("/")[0];
		const imagesRef = ref(
			storage,
			`/Screen Media/${new Date().getTime() + el.files[0].name}`
		);
		uploadBytes(imagesRef, el.files[0])
			.then((snapshot) => {
				console.log("Uploaded a blob or file!");
				console.log(snapshot);
				getDownloadURL(snapshot.ref)
					.then((url) => {
						console.log(url);
						setFormData({ ...formData, media_url: url, media_type: fileType });
						updateDoc(doc(db, "users", auth.currentUser.uid), {
							["screen" + screen]: {
								...formData,
								media_url: url,
								media_type: fileType,
							},
						})
							.then(() => {
								showSuccess("Image uploaded successfully");
								setLoading(false);
								fetchUserGames();
							})
							.catch((err) => {
								console.log(err);
								setLoading(false);
								showError("Save failed");
							});
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

	const handleChangeOrientation = (e) => {
		setLoading(true);
		updateDoc(doc(db, "users", auth.currentUser.uid), {
			["screen" + screen]: {
				...data,
				orientation: e.target.value,
			},
		})
			.then(() => {
				showSuccess("Successfully updated");
				setLoading(false);
				fetchUserGames();
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Failed to update");
			});
	};

	const removeMedia = () => {
		setLoading(true);
		updateDoc(doc(db, "users", auth.currentUser.uid), {
			["screen" + screen]: {
				...data,
				media_url: "",
				media_type: "",
			},
		})
			.then(() => {
				showSuccess("Successfully removed");
				setLoading(false);
				fetchUserGames();
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Failed to remove");
			});
	};

	useEffect(() => {
		if (data) {
			setFormData(data);
		} else {
			setFormData(initialState);
		}
	}, [data, screen]);

	return (
		<div className='text-black'>
			<Spin spinning={loading} />
			<div className='mt-4'>
				<div className='text-black'>Screen Orientation</div>
				<Form.Group>
					<div className='form-check mr-5'>
						<label className='form-check-label'>
							<input
								type='radio'
								className='form-check-input w-min'
								name='screen_orientation'
								id='screen_orientation1'
								value='landscape'
								checked={formData.orientation === "landscape"}
								onChange={handleChangeOrientation}
							/>
							<i className='input-helper'></i>
							Landscape
						</label>
					</div>
					<div className='form-check'>
						<label className='form-check-label'>
							<input
								type='radio'
								className='form-check-input w-min'
								name='screen_orientation'
								id='screen_orientation2'
								value='portrait'
								checked={formData.orientation === "portrait"}
								onChange={handleChangeOrientation}
							/>
							<i className='input-helper'></i>
							Portrait
						</label>
					</div>
				</Form.Group>
			</div>
			<div className='mt-5'>
				<div>
					Upload media to display on your tv screen{" "}
					<span className='textgray'>
						(.jpg, .png, .gif and mp4 formats only)
					</span>
				</div>
				<Form.Group className='row mt-3'>
					<label
						htmlFor='exampleInputEmail2'
						className='col-form-label'
					></label>
					<div className='col-sm-2 d-flex'>
						<button
							style={{
								width: "100%",
								cursor: "pointer",
								minWidth: "max-content",
								fontSize: "1rem",
								background: "#222d5a",
								padding: "18px 80px",
							}}
							type='button'
							class='btn btn-primary btn-icon-text'
						>
							<i class='mdi mdi-upload btn-icon-prepend'></i>Upload Media File
							<input
								id='screen_file_upload'
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
								accept='image/jpeg, image/png, image/gif, video/mp4'
							/>
						</button>
						{formData.media_url && (
							<i
								style={{ fontSize: "2.2rem", color: "gray" }}
								className='ml-4 mdi mdi-trash-can-outline cursor-pointer'
								onClick={removeMedia}
							/>
						)}
					</div>
				</Form.Group>
			</div>
			<div className='mt-5'>
				<div className='text-danger'>Preview</div>
				<div className='mt-2 preview_area'>
					{formData.media_url ? (
						formData.media_type === "image" ? (
							<img src={formData.media_url} alt='media' />
						) : (
							<video src={formData.media_url} controls />
						)
					) : (
						<div className='textgray'>
							{" "}
							Preview of your uploaded media file <br /> appears here
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CScreen;
