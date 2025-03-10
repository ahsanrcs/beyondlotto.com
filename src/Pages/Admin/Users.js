import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { db } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import { confirm } from "react-bootstrap-confirmation";
import Spin from "../../utils/Spin";
import moment from "moment";

const Users = () => {
	const [allUsers, setAllUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const history = useHistory();

	const handleCreate = () => {
		history.push("/users/create?id=0");
	};

	const fetchUsers = () => {
		let tempUsers = [];
		const q = query(collection(db, "users"), orderBy("created_at", "desc"));
		getDocs(q)
			.then((snapshot) => {
				snapshot.forEach((doc) => {
					tempUsers.push({ id: doc.id, ...doc.data() });
					if (typeof doc.data().subscription_expires === typeof {}) {
						console.log(doc.data());
					}
				});
				setAllUsers(tempUsers);
				console.log(tempUsers);
				setLoading(false);
			})
			.catch((err) => {
				showError("Couldn't fetch users");
				console.log(err);
				setLoading(false);
			});
	};

	useEffect(fetchUsers, []);

	const handleBlock = (id) => {
		console.log(id);
		confirm("The User will be blocked", {
			title: "Are you sure?",
			okText: "Block",
			okButtonStyle: "danger",
		})
			.then((res) => {
				if (res) {
					console.log(res);
					setLoading(true);
					updateDoc(doc(db, "users", id), { is_blocked: true })
						.then(() => {
							showSuccess("Successfully blocked");
							setLoading(false);
						})
						.catch((e) => {
							showError("Couldn't block user");
							setLoading(false);
							console.log(e);
						});
				}
			})
			.catch((e) => console.log(e));
	};

	const handleDelete = (id) => {
		console.log(id);
		confirm("The User will be deleted permanently!", {
			title: "Are you sure?",
			okText: "Delete",
			okButtonStyle: "danger",
		})
			.then((res) => {
				fetch(process.env.REACT_APP_SERVER_URL + "/deleteAccount", {
					method: "POST",
					body: JSON.stringify({ id: id }),
				})
					.then((r) => r.json())
					.then((res) => {
						console.log(res);
						if (res.result) {
							fetchUsers();
							showSuccess(res.message);
						} else {
							showError(res.message);
						}
					})
					.catch((e) => {
						console.log(e);
					});
			})
			.catch((err) => console.log(err));
	};

	console.log(allUsers);

	return (
		<div>
			<Spin spinning={loading} />
			<div className='page-header'>
				<h3 className='page-title'> Manage Users </h3>
				<nav aria-label='breadcrumb'>
					<button
						onClick={handleCreate}
						className='nav-link btn btn-success create-new-button no-caret'
					>
						+ Create New User
					</button>
				</nav>
			</div>

			<div className='row'>
				<div className='col-lg-12 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							{/* <h4 className='card-title'>Striped Table</h4>
							<p className='card-description'>
								{" "}
								Add className <code>.table-striped</code>
							</p> */}
							<div className='table-responsive'>
								<table className='table table-striped'>
									<thead>
										<tr>
											<th> S. No </th>
											<th> Name </th>
											<th> Email </th>
											<th> Phone </th>
											<th> Active </th>
											<th> Plan </th>
											<th> Paid </th>
											<th> Expiry Date</th>
											<th> Actions </th>
										</tr>
									</thead>
									<tbody>
										{allUsers.map((u, _i) => (
											<tr key={_i}>
												<td>{_i + 1}</td>
												<td> {u.name} </td>
												<td>{u.email}</td>
												<td> {u.phone} </td>
												<td
													className={`${
														u.login_status ? "text-success" : "text-danger"
													}`}
												>
													{" "}
													{u.login_status ? "Yes" : "No"}{" "}
												</td>
												<td>{u.account_type || "N/A"}</td>
												<td
													className={`${
														u.is_paid_user ? "text-success" : "text-danger"
													}`}
												>
													{" "}
													{u.is_paid_user ? "Yes" : "No"}{" "}
												</td>
												<td
													className={`${
														moment().format("YYYY-MM-DD") <
														u.subscription_expires
															? "text-black"
															: "text-danger"
													}`}
												>
													{u.subscription_expires
														? u.subscription_expires
														: "N/A"}
												</td>
												<td className='actions'>
													<i
														onClick={() => {
															history.push(`/users/view?id=${u.id}`);
														}}
														className='mr-1 text-info mdi mdi-eye h5'
													/>{" "}
													<i
														onClick={() => {
															history.push(`/users/create?id=${u.id}`);
														}}
														className='mr-1 text-warning mdi mdi-pencil h5'
													/>{" "}
													<i
														onClick={() => handleBlock(u.id)}
														className='mr-1 text-danger mdi mdi-block-helper h5'
													/>{" "}
													<i
														onClick={() => handleDelete(u.id)}
														className='text-danger mdi mdi-delete h5'
													/>{" "}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Users;
