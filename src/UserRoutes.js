import React, { Suspense, useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Spin from "./utils/Spin.js";
import { useStateValue } from "./State/Stateprovider";

const AppDownloadPopup = React.lazy(() => import("./Components/AppDownloadPopup"));
const Global = React.lazy(() => import("./Pages/Users/Global.js"));
const Dashboard = React.lazy(() => import("./Pages/Users/Dashboard.js"));
const Status = React.lazy(() => import("./Pages/Users/Status.js"));
const Profile = React.lazy(() => import("./Pages/Users/Profile.js"));
const Subscription = React.lazy(() => import("./Pages/Users/Subscription.js"));
const Privacy = React.lazy(() => import("./Pages/Privacy.js"));

const UserRoutes = () => {
  const [{ user }] = useStateValue();
  // const [showPopup, setShowPopup] = useState(false);

  // useEffect(() => {
  //   if (user?.role === "user") {
  //     const dontShow = localStorage.getItem("dontShowAppDownload");
  //     if (dontShow !== "true") {
  //       setShowPopup(true); // Set showPopup directly without delay
  //     }
  //   }
  // }, [user]);

  return (
    <Suspense fallback={<Spin spinning={true} />}>
      <Switch>
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/settings" component={Global} />
        <Route exact path="/status" component={Status} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/subscription" component={Subscription} />
        <Route exact path="/privacy-policy" component={Privacy} />
        <Redirect from="/" to="/dashboard" />
      </Switch>
      {/* Show App Download Popup */}
      {/* <AppDownloadPopup show={showPopup} handleClose={() => setShowPopup(false)} /> */}
    </Suspense>
  );
};

export default UserRoutes;