import React from "react";
import Loader from "react-loader";

const Spin = ({ spinning = false }) => {
	return <Loader loaded={!spinning} shadow color='green' />;
};

export default Spin;
