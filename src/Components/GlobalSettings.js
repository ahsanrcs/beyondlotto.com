import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { db } from "../firebase";
import { showError, showSuccess } from "../utils/functions";
import Spin from "../utils/Spin";

const initialState = {
	power_ball: "",
	mega_ball: "",
	texas_loto: "",
	texas_two_step: "",
	pick_3: "",
	daily_4: "",
	cash_five: "",
	all_or_nothing: "",
};

const GlobalSettings = () => {
	const [formData, setFormData] = useState(initialState);
	const [loading, setLoading] = useState(false);

	const fetchGlobalSettings = () => {
		setLoading(true);
		getDoc(doc(db, "settings", "global"))
			.then((d) => {
				if (d.exists()) {
					setFormData(d.data());
				}
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
				showError("Couldn't get global settings");
				setLoading(false);
			});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);

		const newData = { ...formData };
		newData.updated_at = new Date();

		setDoc(doc(db, "settings", "global"), newData)
			.then((d) => {
				setFormData(initialState);
				showSuccess("Global settings successfully updated");
				fetchGlobalSettings();
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
				showError("Something went wrong!");
				setLoading(false);
			});
	};

	useEffect(() => fetchGlobalSettings(), []);

	return (
		<div>
			<Spin spinning={loading} />
			<div className='row center'>
				<div className='col-md-12 grid-margin center stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<h4 className='card-title'>Global Settings</h4>
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
										Mega Ball
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.mega_ball}
											type='text'
											className='form-control'
											id='exampleInputUsername2'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({ ...formData, mega_ball: e.target.value })
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Power Ball
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.power_ball}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													power_ball: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Texas Loto
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.texas_loto}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													texas_loto: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Texas Two Step
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.texas_two_step}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													texas_two_step: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Pick 3
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.pick_3}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													pick_3: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Daily 4
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.daily_4}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													daily_4: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										Cash Five
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.cash_five}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													cash_five: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									>
										All or Nothing
									</label>
									<div className='col-sm-9'>
										<Form.Control
											value={formData.all_or_nothing}
											type='text'
											className='form-control'
											id='exampleInputMobile'
											placeholder='Enter Value'
											onChange={(e) =>
												setFormData({
													...formData,
													all_or_nothing: e.target.value,
												})
											}
										/>
									</div>
								</Form.Group>
								<Form.Group className='row'>
									<label
										htmlFor='exampleInputMobile'
										className='col-sm-3 col-form-label'
									></label>
									<div className='mt-3 col-sm-9'>
										<button
											onClick={handleSubmit}
											type='submit'
											className='btn btn-success pl-5 pr-5'
										>
											Save
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

export default GlobalSettings;
