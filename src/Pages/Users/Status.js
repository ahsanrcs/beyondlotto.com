import { doc, getDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import Spin from "../../utils/Spin";

const Status = () => {
	const [data, setData] = useState({});
	const [loading, setLoading] = useState(true);

	const fetchData = () => {
		setLoading(true);
		getDoc(doc(db, "users", auth.currentUser.uid))
			.then((d) => {
				if (d.exists()) {
					const { login_status, device, last_login } = d.data();
					setData({ login_status, device, last_login });
					setLoading(false);
				} else {
					setLoading(false);
					showError("User not found");
				}
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Something went wrong");
			});
	};

	useEffect(fetchData, []);

	const handleTVLogout = () => {
		setLoading(true);
		updateDoc(doc(db, "users", auth.currentUser.uid), {
			login_status: false,
		})
			.then((d) => {
				setLoading(false);
				showSuccess("Successfully logged out");
				fetchData();
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
				showError("Couldn't logout");
			});
	};

	return (
		<div>
			<Spin spinning={loading} />
			<div style={{ flexWrap: "nowrap" }} className='row'>
				<div className='col-xl-4 col-sm-4 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className=' align-items-center align-self-start'>
										<h4 className='mb-0'>
											{data.last_login
												? moment
														.unix(data.last_login.seconds)
														.format("MMM DD, YYYY")
												: "N/A"}
										</h4>
										<h6 className='text-gray mt-1'>
											{data.last_login &&
												moment.unix(data.last_login.seconds).format("hh:mm A")}
										</h6>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-info '>
										<span className='mdi mdi-login icon-item'></span>
									</div>
								</div>
							</div>
							<p className='text-muted font-weight-normal'>Last Login</p>
						</div>
					</div>
				</div>
				<div className='col-xl-4 col-sm-4 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className='d-flex align-items-center align-self-start'>
										<h4 className='mb-0'>{data.device || "N/A"}</h4>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-primary'>
										<span className='mdi mdi-cellphone icon-item'></span>
									</div>
								</div>
							</div>
							<p className='text-muted font-weight-normal'>Device</p>
						</div>
					</div>
				</div>
				<div className='col-xl-4 col-sm-4 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className='d-flex align-items-center align-self-start'>
										<h4 className='mb-0'>
											{data.login_status ? "Logged In" : "Logged Out"}
										</h4>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-success'>
										<span className='mdi mdi-account-check icon-item'></span>
									</div>
								</div>
							</div>
							<p className='text-muted font-weight-normal'>Login Status</p>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div className='row center'>
					<div className='col-md-12 grid-margin center stretch-card'>
						<div className='card'>
							<div className='card-body'>
								<h4 className='card-title'>Session Management</h4>
								<p className='card-description'>
									You can only logout of your TV App from here
								</p>
								<div className='mt-4'>
									<button
										onClick={handleTVLogout}
										disabled={!data.login_status}
										type='submit'
										className='btn btn-danger pl-5 pr-5'
									>
										<i className='mdi mdi-logout mr-2' />
										Logout of TV App
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Status;
