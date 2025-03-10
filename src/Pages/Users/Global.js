import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Screen from "../../Components/Screen";
import SettingsScreen from "../../Components/SettingsScreen";
import { auth, db } from "../../firebase";
import { useStateValue } from "../../State/Stateprovider";
import { subscriptions } from "../../utils/constants";
import { showError } from "../../utils/functions";

const Gloabl = () => {
	const [userData, setUserData] = useState(null);
	const [screen, setScreen] = useState(1);
	const [showScreen, setShowScreen] = useState();
	const [loading, setLoading] = useState(false);
	const [validScreens, setValidScreens] = useState([]);
	const [{ user }] = useStateValue();

	const fetchUserData = () => {
		getDoc(doc(db, "users", auth.currentUser.uid))
			.then((d) => {
				if (d.exists()) {
					setUserData(d.data());
				} else {
					showError("User not found");
					setLoading(false);
				}
			})
			.catch((e) => {
				console.log(e);
				setLoading(false);
				showError("Something went wrong");
			});
	};

	useEffect(fetchUserData, []);

	useEffect(() => {
		if (user) {
			const acc = user.account_type || "basic";
			setValidScreens(
				subscriptions
					.filter((a) => a.name === acc)[0]
					.screens.filter((v) => v < 3)
			);
		}
	}, [user]);

	return (
		<div>
			<div className='d-flex ml-2'>
				{validScreens.map((_) => (
					<div key={_}>
						<button
							onClick={() => setScreen(_)}
							id={`s_btn${_}`}
							className={`btn ${
								screen === _ ? "btn-primary" : "btn-outline-primary"
							} mr-2 px-5`}
						>
							Screen {_}
						</button>
					</div>
				))}
			</div>
			{userData && (
				<SettingsScreen
					data={userData[`screen${screen}`]}
					screen={screen}
					fetchUserData={fetchUserData}
				/>
			)}
		</div>
	);
};

export default Gloabl;
