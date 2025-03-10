import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { db } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import { confirm } from "react-bootstrap-confirmation";
import Spin from "../../utils/Spin";

const Games = () => {
	const [allGames, setallGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const history = useHistory();

	const handleCreate = () => {
		history.push("/games/create?id=0");
	};

	const fetchDocs = () => {
		setLoading(true);
		let tempUsers = [];
		getDocs(collection(db, "games"))
			.then((snapshot) => {
				snapshot.forEach((doc) => {
					tempUsers.push({ id: doc.id, ...doc.data() });
				});
				setallGames(tempUsers);
				console.log(tempUsers);
				setLoading(false);
			})
			.catch((err) => {
				showError("Couldn't fetch games");
				console.log(err);
				setLoading(false);
			});
	};

	useEffect(fetchDocs, []);

	const handleDelete = (id) => {
		console.log(id);
		confirm("The Game will be deleted permanently!", {
			title: "Are you sure?",
			okText: "Delete",
			okButtonStyle: "danger",
		})
			.then((res) => {
				if (res) {
					setLoading(true);
					deleteDoc(doc(db, "games", id))
						.then(() => {
							showSuccess("Game deleted successfully");
							setLoading(false);
						})
						.catch((err) => {
							showError("Couldn't delete game");
							console.log(err);
							setLoading(false);
						});
					fetchDocs();
				}
			})
			.catch((err) => console.log(err));
	};

	console.log(allGames);

	return (
		<div>
			<Spin spinning={loading} />
			<div className='page-header'>
				<h3 className='page-title'> Manage Games </h3>
				<nav aria-label='breadcrumb'>
					<button
						onClick={handleCreate}
						className='nav-link btn btn-success create-new-button no-caret'
					>
						+ Create New Game
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
											<th> Game Number </th>
											<th> Details </th>
											<th> Ticket Value </th>
											<th> Thumbnail </th>
											<th> Actions </th>
										</tr>
									</thead>
									<tbody>
										{allGames.map((g, _i) => (
											<tr key={_i}>
												<td>{_i + 1}</td>
												<td>{g.number}</td>
												<td> {g.description} </td>
												<td>{g.ticket_value}</td>
												<td>
													<img
														style={{ borderRadius: 0 }}
														loading='lazy'
														src={g.image_url}
														alt='thumbnail'
													/>
												</td>
												<td className='actions'>
													<i
														onClick={() => {
															history.push(`/games/create?id=${g.id}`);
														}}
														className='mr-3 text-warning mdi mdi-pencil h4'
													/>{" "}
													<i
														onClick={() => handleDelete(g.id)}
														className='text-danger mdi mdi-delete h4'
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

export default Games;
