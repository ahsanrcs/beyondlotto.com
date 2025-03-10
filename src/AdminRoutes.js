import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Spin from "./utils/Spin.js";

const Profile = React.lazy(() => import("./Pages/Users/Profile.js"));
const Dashboard = React.lazy(() => import("./Pages/Admin/Dashboard.js"));
const Users = React.lazy(() => import("./Pages/Admin/Users.js"));
const Games = React.lazy(() => import("./Pages/Admin/Games.js"));
const AddUser = React.lazy(() => import("./Pages/Admin/AddUser.js"));
const AddGame = React.lazy(() => import("./Pages/Admin/AddGame.js"));
const ViewProfile = React.lazy(() => import("./Pages/Admin/ViewProfile.js"));
const Privacy = React.lazy(() => import("./Pages/Privacy.js"));

const AdminRoutes = () => {
	return (
		<Suspense fallback={<Spin spinning={true} />}>
			<Switch>
				<Route exact path='/profile' component={Profile} />
				<Route exact path='/dashboard' component={Dashboard} />
				<Route exact path='/users' component={Users} />
				<Route exact path='/games' component={Games} />
				<Route exact path='/users/create' component={AddUser} />
				<Route exact path='/users/view' component={ViewProfile} />
				<Route exact path='/games/create' component={AddGame} />
				<Route exact path='/privacy-policy' component={Privacy} />
				<Redirect exact from='/' to='/dashboard' />
			</Switch>
		</Suspense>
	);
};

export default AdminRoutes;
