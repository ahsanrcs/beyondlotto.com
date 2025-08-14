import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import CScreen from "../../Components/CScreen";
import Screen from "../../Components/Screen";
import { auth, db } from "../../firebase";
import { useStateValue } from "../../State/Stateprovider";
import { subscriptions } from "../../utils/constants";
import { showError } from "../../utils/functions";
import moment from "moment";
import { useHistory } from "react-router-dom";
import RecentImages from "../../Components/RecentImages";
import AppDownloadPopup from "../../Components/AppDownloadPopup"; // Ensure correct path

const Dashboard = () => {
	const [userData, setUserData] = useState(null);
	const [screen, setScreen] = useState(1);
	const [showScreen, setShowScreen] = useState();
	const [loading, setLoading] = useState(false);
	const [validScreens, setValidScreens] = useState([]);
	const [modal, setModal] = useState(false);
	const [{ user }] = useStateValue();
	const history = useHistory();

// App Download Popup Logic
const [showPopup, setShowPopup] = useState(false);

useEffect(() => {
  const dontShow = localStorage.getItem("dontShowAppDownload");
  if (dontShow !== "true") {
	setShowPopup(true);
  }
}, []);

	const fetchUserGames = () => {
		// console.log("fetchUserGames running");
		getDoc(doc(db, "users", auth.currentUser.uid))
			.then((d) => {
				if (d.exists()) {
					setUserData(d.data());

					// const tempArr = [...array_for_boxes];
					// for (let i = 0; i < parseInt(total_boxes); i++) {
					// 	if (!tempArr[i]) {
					// 		tempArr[i] = null;
					// 	}
					// }
					// setBoxes([...tempArr]);
					// setDefaultBoxes([...tempArr]);
					// setTotalBoxes(parseInt(total_boxes));
					// setCustomImage(
					// 	empty_box === "Custom" ? empty_box_custom_image : empty_box
					// );
					// tempArr.map((a, _i) => console.log(a, _i));
					// setLoading(false);
					// setChangeKey(Math.random());
					// fetchGames(tempArr);
				} else {
					showError("User not found");
					setLoading(false);
				}
			})
			.catch((e) => {
				// console.log(e);
				setLoading(false);
				showError("Something went wrong");
			});
	};

	useEffect(() => {
		if (user) {
			// console.log(user);
			const acc = user.account_type || "basic";
			setValidScreens(subscriptions.filter((a) => a.name === acc)[0].screens);
		}
	}, [user]);

	useEffect(() => {
		if (user?.subscription_expires < moment().format("YYYY-MM-DD")) {
			setModal(true);
		}
	}, [user]);

	// console.log(validScreens);

	useEffect(fetchUserGames, []);

	return (
		<div>
			{modal && (
				<Modal show={modal} centered>
					<Modal.Header style={{ background: "white", color: "black" }}>
						<Modal.Title>
							<div className='text-center'>
								<div className='text-black'>Subscription Expired</div>
							</div>
						</Modal.Title>
					</Modal.Header>
					<div
						style={{
							background: "white",
							color: "red",
							textAlign: "center",
							padding: "2rem 3rem 1rem 3rem",
							fontSize: "1rem",
						}}
					>
						Your subscription has been expired since{" "}
						{user?.subscription_expires}. Please renew your subscription to
						continue using the app.
					</div>
					<div
						style={{
							background: "white",
							color: "black",
							textAlign: "center",
							padding: "1rem 5rem 2rem 5rem",
							fontSize: "1rem",
						}}
					>
						Contact support:{" "}
						<a style={{ color: "#02df70" }} href='tel:+16823860871'>
							+1 682 386 0871
						</a>{" "}
					</div>
					<Modal.Footer style={{ background: "white", color: "black" }}>
						<div>
							<button
								onClick={() => history.push("/subscription")}
								style={{ padding: "15px 40px" }}
								className='btn btn-primary'
							>
								Go to subscription page
							</button>
						</div>
					</Modal.Footer>
				</Modal>
			)}
			<RecentImages />
			<div className='d-flex'>
				{validScreens.map((_) => (
					<div key={_}>
						<button
							onClick={() => setScreen(_)}
							id={`s_btn${_}`}
							className={`btn ${
								screen === _ ? "btn-primary" : "btn-outline-primary"
							} mr-2 px-3`}
						>
							Screen {_}
						</button>
					</div>
				))}
			</div>
			{userData &&
				(screen === 1 || screen === 2 ? (
					<Screen
						data={userData[`screen${screen}`]}
						screen={screen}
						fetchUserGames={fetchUserGames}
						userData={userData}
					/>
				) : (
					<CScreen
						data={userData[`screen${screen}`]}
						screen={screen}
						fetchUserGames={fetchUserGames}
					/>
				))}

				 {/* App Download Popup */}
				  <AppDownloadPopup show={showPopup} handleClose={() => setShowPopup(false)} /> 
		</div>
	);
};

export default Dashboard;
