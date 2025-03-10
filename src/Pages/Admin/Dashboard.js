import {doc,updateDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import GlobalSettings from "../../Components/GlobalSettings";
import { db } from "../../firebase";
import { showError, showSuccess } from "../../utils/functions";
import Spin from "../../utils/Spin";
import moment from "moment";
import { useHistory } from "react-router-dom";
// import { TodoListComponent } from "../apps/TodoList";

const Dashboard = () => {
	const [allUsers, setAllUsers] = useState([]);
	const [allGames, setallGames] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [activeFilter, setActiveFilter] = useState("All");
	const [users, setallUsers] = useState([]);
	const [activeUsers, setActiveUsers] = useState(0);
	const [subscriptions, setSubscriptions] = useState(0);
	const [loading, setLoading] = useState(true);
	const [activeNowUsers, setActiveNowUsers] = useState(0);
  const [activeIn24Users, setActiveIn24Users] = useState(0);

  const history = useHistory();
  
  const handleCreate = () => {
	history.push("/users/create?id=0");
  };
	const fetchGames = () => {
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

	const fetchUsers = () => {
		setLoading(true);
		let tempUsers = [];
		getDocs(collection(db, "users"))
			.then((snapshot) => {
				snapshot.forEach((doc) => {
					tempUsers.push({ id: doc.id, ...doc.data() });
				});

				const active = tempUsers.filter((u) => u.login_status);
				const subs = tempUsers.filter((u) => u.is_paid_user);
				const activeNow = tempUsers.filter((u) => {
					if (!u.lastActive) return false;
let lastActive;
if (typeof u.lastActive === "string") {
  lastActive = moment(u.lastActive, "MMMM DD, YYYY HH:mm:ss", true);
} else if (u.lastActive?.seconds) {
  lastActive = moment.unix(u.lastActive.seconds);
} else {
  return false;
}
if (!lastActive.isValid()) return false;

				  
					return lastActive.isValid() && moment().diff(lastActive, "minutes") <= 10;
				  });
				  
				  const activeIn24 = tempUsers.filter((u) => {
					if (!u.lastActive) return false; // Ignore users without a valid timestamp
				  
					let lastActive;
				  
					if (typeof u.lastActive === "string") {
					  lastActive = moment(u.lastActive, "MMMM DD, YYYY HH:mm:ss", true); // Strict parsing
					} else if (u.lastActive.seconds) {
					  lastActive = moment.unix(u.lastActive.seconds);
					} else {
					  return false; // Invalid date format
					}
				  
					return lastActive.isValid() && moment().diff(lastActive, "hours") <= 24;
				  });
				  


				setallUsers(tempUsers);
				setAllUsers(tempUsers);
				setSubscriptions(subs.length);
				setActiveUsers(active.length);
				setActiveNowUsers(activeNow.length);
				setActiveIn24Users(activeIn24.length);
				console.log(tempUsers);
				setLoading(false);
			})
			.catch((err) => {
				showError("Couldn't fetch users");
				console.log(err);
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchUsers();
		fetchGames();
	}, []);
	// const handleBlock = (id) => {
	// 		console.log(id);
	// 		confirm("The User will be blocked", {
	// 			title: "Are you sure?",
	// 			okText: "Block",
	// 			okButtonStyle: "danger",
	// 		})
	// 			.then((res) => {
	// 				if (res) {
	// 					console.log(res);
	// 					setLoading(true);
	// 					updateDoc(doc(db, "users", id), { is_blocked: true })
	// 						.then(() => {
	// 							showSuccess("Successfully blocked");
	// 							setLoading(false);
	// 						})
	// 						.catch((e) => {
	// 							showError("Couldn't block user");
	// 							setLoading(false);
	// 							console.log(e);
	// 						});
	// 				}
	// 			})
	// 			.catch((e) => console.log(e));
	// 	};
	
	// 	const handleDelete = (id) => {
	// 		console.log(id);
	// 		confirm("The User will be deleted permanently!", {
	// 			title: "Are you sure?",
	// 			okText: "Delete",
	// 			okButtonStyle: "danger",
	// 		})
	// 			.then((res) => {
	// 				fetch(process.env.REACT_APP_SERVER_URL + "/deleteAccount", {
	// 					method: "POST",
	// 					body: JSON.stringify({ id: id }),
	// 				})
	// 					.then((r) => r.json())
	// 					.then((res) => {
	// 						console.log(res);
	// 						if (res.result) {
	// 							fetchUsers();
	// 							showSuccess(res.message);
	// 						} else {
	// 							showError(res.message);
	// 						}
	// 					})
	// 					.catch((e) => {
	// 						console.log(e);
	// 					});
	// 			})
	// 			.catch((err) => console.log(err));
	// 	};
	console.log(allGames);
	console.log(users);
	console.log(activeUsers);
	console.log(subscriptions);

	const filterUsers = (filter) => {
		setActiveFilter(filter);
		if (filter === "All") {
		  setFilteredUsers(allUsers);
		  console.log(allUsers);
		} 
		else if (filter === "Active Now") {
		  setFilteredUsers(allUsers.filter((u) => {
			if (!u.lastActive) return false;
			let lastActive = typeof u.lastActive === "string" 
			  ? moment(u.lastActive, "MMMM DD, YYYY HH:mm:ss", true) 
			  : moment.unix(u.lastActive.seconds);
			return lastActive.isValid() && moment().diff(lastActive, "minutes") <= 10;
		  }));
		} else if (filter === "Active Today") {
		  setFilteredUsers(allUsers.filter((u) => {
			if (!u.lastActive) return false;
			let lastActive = typeof u.lastActive === "string" 
			  ? moment(u.lastActive, "MMMM DD, YYYY HH:mm:ss", true) 
			  : moment.unix(u.lastActive.seconds);
			return lastActive.isValid() && moment().diff(lastActive, "hours") <= 24;
		  }));
		}  else {
		  const filtered = allUsers.filter((user) => user.payment_type === filter);
		  setFilteredUsers(filtered);
		}
	  };
	
	  const filters = [
		"All",
		"Active Now",
		"Active Today"
	
	  ];
	return (
		<div>
			<Spin spinning={loading} />
			<div className='row'>
				<div className='col-xl-3 col-sm-6 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className='d-flex align-items-center align-self-start'>
										<h3 className='mb-0'>{users.length}</h3>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-success '>
										<span className='mdi mdi-account-multiple icon-item'></span>
									</div>
								</div>
							</div>
							<h6 className='text-muted font-weight-normal'>Total Users</h6>
						</div>
					</div>
				</div>
				<div className="col-xl-3 col-sm-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-9">
                  <div className="d-flex align-items-center align-self-start">
                    <h3 className="mb-0">{activeNowUsers}</h3>
                  </div>
                </div>
                <div className="col-3">
                  <div className="icon icon-box-success">
                    <span className="mdi mdi-account-key icon-item"></span>
                  </div>
                </div>
              </div>
              <h6 className="text-muted font-weight-normal">Active Now Users</h6>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-9">
                  <div className="d-flex align-items-center align-self-start">
                    <h3 className="mb-0">{activeIn24Users}</h3>
                  </div>
                </div>
                <div className="col-3">
                  <div className="icon icon-box-success">
                    <span className="mdi mdi-account-key icon-item"></span>
                  </div>
                </div>
              </div>
              <h6 className="text-muted font-weight-normal">Active Users in last 24 Hrs</h6>
            </div>
          </div>
        </div>
				<div className='col-xl-3 col-sm-6 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className='d-flex align-items-center align-self-start'>
										<h3 className='mb-0'>{subscriptions}</h3>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-success'>
										<span className='mdi mdi-account-check icon-item'></span>
									</div>
								</div>
							</div>
							<h6 className='text-muted font-weight-normal'>Subsciptions</h6>
						</div>
					</div>
				</div>
				<div className='col-xl-3 col-sm-6 grid-margin stretch-card'>
					<div className='card'>
						<div className='card-body'>
							<div className='row'>
								<div className='col-9'>
									<div className='d-flex align-items-center align-self-start'>
										<h3 className='mb-0'>{allGames.length}</h3>
									</div>
								</div>
								<div className='col-3'>
									<div className='icon icon-box-success '>
										<span className='mdi mdi-gamepad-variant icon-item'></span>
									</div>
								</div>
							</div>
							<h6 className='text-muted font-weight-normal'>Total Games</h6>
						</div>
					</div>
				</div>
			</div>
			
			<h4 className=" ml-1 card-title text-black">Filter by Status </h4>
      <div className=" ml-1 row mb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`btn mr-2 ${
              activeFilter === filter ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => filterUsers(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th> S. No </th>
              <th> Name </th>
              <th> Email </th>
              <th> Phone </th>
              <th> Payment Type </th>
              <th> Actions </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.payment_type || "None"}</td>
                <td className="actions">
                          <i
                            onClick={() => {
                              history.push(`/users/view?id=${user.id}`);
                            }}
                            className="mr-1 text-info mdi mdi-eye h5"
                          />{" "}
                          <i
                            onClick={() => {
                              history.push(`/users/create?id=${user.id}`);
                            }}
                            className="mr-1 text-warning mdi mdi-pencil h5"
                          />{" "}
                          {/* <i
                            onClick={() => handleBlock(user.id)}
                            className="mr-1 text-danger mdi mdi-block-helper h5"
                          />{" "}
                          <i
                            onClick={() => handleDelete(user.id)}
                            className="text-danger mdi mdi-delete h5"
                          />{" "} */}
                        </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
	  <GlobalSettings />
		</div>
		
	);
};

export default Dashboard;
