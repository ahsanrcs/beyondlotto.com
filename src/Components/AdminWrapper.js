import React from "react";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";

const AdminWrapper = ({ children }) => {
	return (
		<div className='container-scroller'>
			<AdminSidebar />
			<div className='container-fluid page-body-wrapper'>
				<Navbar />
				<div className='main-panel'>
					<div className='content-wrapper bg-white'>{children}</div>
				</div>
			</div>
		</div>
	);
};

export default AdminWrapper;
