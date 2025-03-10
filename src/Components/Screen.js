import {
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { auth, db } from "../firebase";
import { showError, showSuccess } from "../utils/functions";
import Spin from "../utils/Spin";

const Screen = ({ data, screen, fetchUserGames }) => {
	const [boxes, setBoxes] = useState([]);
	const [animate_box, setAnimateBox] = useState([]);
	const [defaultBoxes, setDefaultBoxes] = useState([]);
	const [totalBoxes, setTotalBoxes] = useState(0);
	const [games, setGames] = useState({});
	const [customImage, setCustomImage] = useState(null);
	const [changeKey, setChangeKey] = useState(Math.random());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!data) {
			showError("Something went wrong");
			setLoading(false);
			return;
		}
		const {
			array_for_boxes,
			total_boxes,
			empty_box,
			empty_box_custom_image,
			animation_for_boxes,
		} = data;
		const tempArr = [...array_for_boxes];
		const tempArr2 = animation_for_boxes ? [...animation_for_boxes] : [];
		for (let i = 0; i < parseInt(total_boxes); i++) {
			if (!tempArr[i]) {
				tempArr[i] = null;
			}
			if (!tempArr2[i]) {
				tempArr2[i] = false;
			}
		}
		setBoxes([...tempArr]);
		setAnimateBox([...tempArr2]);
		setDefaultBoxes([...tempArr]);
		setTotalBoxes(parseInt(total_boxes));
		setCustomImage(empty_box === "Custom" ? empty_box_custom_image : empty_box);
		tempArr.map((a, _i) => console.log(a, _i));
		setLoading(false);
		setChangeKey(Math.random());
		fetchGames(tempArr);
	}, [screen, data]);

	const fetchGames = async (arr) => {
		const qArr = arr.filter((a) => a);
		const ln = qArr.length;

		const dv = Math.ceil(ln / 10);
		const pt = Math.ceil(ln / dv);

		const times = [];

		for (let i = 0; i < dv; i++) {
			const start = i * pt;
			const end = start + pt;
			const tempArr = qArr.slice(start, end);
			times.push(tempArr);
		}

		const gamesObj = {};

		const gameRef = collection(db, "games");

		for await (const v of times) {
			const q = query(gameRef, where("number", "in", v));
			const docs = await getDocs(q);
			docs.forEach((doc) => {
				gamesObj[doc.data().number] = doc.data().image_url;
			});
		}

		setGames(gamesObj);
	};

	const saveGame = (_i, _no, _anim = animate_box) => {
		setLoading(true);
		// console.log(_i, _no);
		console.log(boxes);
		const gameRef = collection(db, "games");
		const q = query(gameRef, where("number", "==", _no));

		getDocs(q)
			.then((docs) => {
				if (docs.empty) {
					showError("Game not found");
					setLoading(false);
					return;
				}
				updateDoc(doc(db, "users", auth.currentUser.uid), {
					["screen" + screen]: {
						...data,
						array_for_boxes: boxes,
						animation_for_boxes: _anim,
					},
				})
					.then(() => {
						showSuccess("Successfully saved");
						setAnimateBox([..._anim]);
						setLoading(false);
						fetchUserGames();
					})
					.catch((err) => {
						console.log(err);
						setLoading(false);
						showError("Save failed");
					});
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Save failed");
			});
	};

	const deleteGame = (_i, _no) => {
		setLoading(true);
		const tempArr = [...boxes];

		tempArr[_i] = null;
		updateDoc(doc(db, "users", auth.currentUser.uid), {
			["screen" + screen]: { ...data, array_for_boxes: tempArr },
		})
			.then(() => {
				showSuccess("Successfully deleted");
				setLoading(false);
				fetchUserGames();
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Failed to delete");
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

	return (
		<div>
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
								checked={data.orientation === "landscape"}
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
								checked={data.orientation === "portrait"}
								onChange={handleChangeOrientation}
							/>
							<i className='input-helper'></i>
							Portrait
						</label>
					</div>
				</Form.Group>
			</div>
			<div className='row'>
				{Array.from(Array(totalBoxes).keys()).map((i) => (
					<div
						key={i}
						className='col-xl-2 col-lg-3 col-md-4 col-sm-5  grid-margin stretch-card'
						style={{ padding: "0rem 0.4rem" }}
					>
						<div className='card bg-secondary'>
							<div
								style={{ padding: "0.5rem 1rem" }}
								className='card-body mt-0'
							>
								<div className='text-center text-black small-text mb-1'>
									{i + 1}
								</div>
								<div
									style={{ height: "21vh", maxHeight: "150px" }}
									className='col-16 border border-black'
								>
									{games[defaultBoxes[i]] ? (
										<img
											style={{
												height: "100%",
												width: "100%",
												objectFit: "cover",
											}}
											loading='lazy'
											alt='game cover'
											src={games[defaultBoxes[i]]}
										/>
									) : customImage ? (
										customImage === "Coming Soon" ? (
											<div className='bg-white w-100 h-100 d-flex justify-content-center align-items-center text-gray'>
												Coming Soon
											</div>
										) : (
											<img
												style={{
													height: "100%",
													width: "100%",
													objectFit: "cover",
												}}
												loading='lazy'
												alt='game cover'
												src={customImage}
											/>
										)
									) : (
										<div className='bg-white w-100 h-100'></div>
									)}
									{/* <div
  style={{
    position: "absolute",
    top: "38px",
    left: "-22px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "black",
    fontWeight: "bold",
    padding: `${di?.ticket_value == "$100" ? "0px 28px" : "1px 35px"}`,
    fontSize: "13px",
    transform: "rotate(-45deg)",
    transformOrigin: "left top",
    borderTopLeftRadius: "10px", // Adjust the value for desired roundness
    borderTopRightRadius: "10px", // Adjust the value for desired roundness
  }}
>
  {i?.ticket_value}
</div> */}
								</div>
								<div className='row'>
									<div className='col-12'>
										<div
											style={{ gap: "5px" }}
											className='mt-2 d-flex align-items-center align-self-start justify-content-between'
										>
											<div style={{ flex: 1 }}>
												<Form.Control
													style={{
														fontSize: "0.8rem",
														padding: "0rem 0.6rem",
														height: "1.6rem",
													}}
													key={changeKey}
													value={boxes[i]}
													type='text'
													className='form-control bg-white text-dark'
													id='game_number'
													placeholder='Number'
													onChange={(e) => {
														let tempArr = [...boxes];
														tempArr[i] = e.target.value;
														setBoxes(tempArr);
													}}
												/>
											</div>
											<Form.Group
												style={{ marginBottom: 0, height: "1.6rem" }}
												className='row stretch'
											>
												<div className=' col-12 d-flex'>
													<button
														onClick={() => saveGame(i, boxes[i])}
														type='submit'
														className='btn btn-success mr-1 dash-btn'
													>
														<i className='mdi mdi-check' />
													</button>
													<button
														onClick={() => deleteGame(i, boxes[i])}
														className='btn btn-danger dash-btn'
													>
														<i className='mdi mdi-close' />
													</button>
												</div>
											</Form.Group>{" "}
										</div>
									</div>
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
												checked={animate_box[i]}
												type='checkbox'
												className='form-check-input'
												onChange={() => {
													let tempArr = [...animate_box];
													tempArr[i] = !animate_box[i];
													saveGame(i, boxes[i], tempArr);
												}}
											/>
											<i className='input-helper ml-3'></i>
											Animate
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Screen;
