import React from "react";
import Navbar from "./Navbar";
import UserSidebar from "./UserSidebar";

const UserWrapper = ({ children }) => {
	return (
		<div className='container-scroller'>
			<UserSidebar />
			<div className='container-fluid page-body-wrapper'>
				<Navbar />
				<div className='main-panel'>
					<div className='content-wrapper bg-white'>{children}</div>
				</div>
			</div>
		</div>
	);
};

export default UserWrapper;
