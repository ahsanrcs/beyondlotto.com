import "./App.scss";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import React, { Suspense, useEffect, useState } from "react";
import "./custom.scss";
import AdminWrapper from "./Components/AdminWrapper";
import AdminRoutes from "./AdminRoutes";
import { useStateValue } from "./State/Stateprovider";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";
import Spin from "./utils/Spin";
import { doc, getDoc } from "firebase/firestore";
import UserWrapper from "./Components/UserWrapper";
import UserRoutes from "./UserRoutes";
import Landing from "./Pages/Landing";

const PUBLIC_ROUTES = ["/", "/login", "/privacy-policy"];

const Login = React.lazy(() => import("./Pages/Login.js"));
const Privacy = React.lazy(() => import("./Pages/Privacy.js"));

const App = () => {
	const [loading, setLoading] = useState(false);
	const [{ user }, action] = useStateValue();
	const history = useHistory();
	const location = useLocation();

	useEffect(() => {
		setLoading(true);
		onAuthStateChanged(auth, (authUser) => {
			if (authUser) {
				getDoc(doc(db, "users", authUser.uid))
					.then((doc) => {
						console.log(doc.data());
						action({
							type: "SET_USER",
							payload: {
								user: {
									id: doc.id,
									...doc.data(),
								},
							},
						});
						setLoading(false);
					})
					.catch((e) => {
						console.log(e);
					});
			} else {
				action({
					type: "SET_USER",
					payload: {
						user: null,
					},
				});
				if (!PUBLIC_ROUTES.includes(location.pathname)) {
					history.push("/");
				}
				setLoading(false);
			}
		});
	}, []);

	useEffect(() => {
		if (user) {
			const el = document.getElementsByTagName("title")[0];
			switch (user.role) {
				case "admin":
					el.innerHTML = "BeyondLotto (Admin)";
					break;
				case "user":
					el.innerHTML = "BeyondLotto (Manager)";
					break;
				default:
					break;
			}
		}
	}, [user]);

	return loading ? (
		<Spin spinning={true} />
	) : (
		<Suspense fallback={<Spin spinning={true} />}>
			{!user ? (
				<>
					<Route exact path='/' component={Landing} />
					<Route exact path='/login' component={Login} />
					<Route exact path='/privacy-policy' component={Privacy} />
				</>
			) : user.role === "admin" ? (
				<AdminWrapper>
					<AdminRoutes />
				</AdminWrapper>
			) : (
				<UserWrapper>
					<UserRoutes />
				</UserWrapper>
			)}
			<Toaster />
		</Suspense>
	);
};

export default App;
