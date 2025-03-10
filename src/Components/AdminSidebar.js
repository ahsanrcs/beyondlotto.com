import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Collapse, Dropdown } from "react-bootstrap";
import { Trans } from "react-i18next";
import { auth } from "../firebase";

class AdminSidebar extends Component {
	state = {};

	toggleMenuState(menuState) {
		if (this.state[menuState]) {
			this.setState({ [menuState]: false });
		} else if (Object.keys(this.state).length === 0) {
			this.setState({ [menuState]: true });
		} else {
			Object.keys(this.state).forEach((i) => {
				this.setState({ [i]: false });
			});
			this.setState({ [menuState]: true });
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			this.onRouteChanged();
		}
	}

	onRouteChanged() {
		document.querySelector("#sidebar").classList.remove("active");
		Object.keys(this.state).forEach((i) => {
			this.setState({ [i]: false });
		});

		const dropdownPaths = [
			{ path: "/apps", state: "appsMenuOpen" },
			{ path: "/basic-ui", state: "basicUiMenuOpen" },
			{ path: "/form-elements", state: "formElementsMenuOpen" },
			{ path: "/tables", state: "tablesMenuOpen" },
			{ path: "/icons", state: "iconsMenuOpen" },
			{ path: "/charts", state: "chartsMenuOpen" },
			{ path: "/user-pages", state: "userPagesMenuOpen" },
			{ path: "/error-pages", state: "errorPagesMenuOpen" },
		];

		dropdownPaths.forEach((obj) => {
			if (this.isPathActive(obj.path)) {
				this.setState({ [obj.state]: true });
			}
		});
	}

	logout() {
		auth.signOut();
	}

	render() {
		return (
			<nav
				style={{ minHeight: "100vh" }}
				className='sidebar sidebar-offcanvas'
				id='sidebar'
			>
				<div className='sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top'>
					<Link className='sidebar-brand brand-logo' href='/dashboard'>
						<img
							src={require("../assets/images/LogoRectangle.png")}
							alt='logo'
						/>
					</Link>
					<Link className='sidebar-brand brand-logo-mini' href='/dashboard'>
						<img
							src={require("../assets/images/LogoRectangle.png")}
							alt='logo'
						/>
					</Link>
				</div>
				<ul className='nav'>
					<li className='nav-item profile'>
						<div className='profile-desc'>
							<div className='profile-pic'>
								<div className='count-indicator'>
									<div
										class='rounded-circle border d-flex justify-content-center align-items-center'
										style={{ width: "35px", height: "35px" }}
										alt='Avatar'
									>
										<i
											style={{ fontSize: "25px" }}
											class='mdi mdi-account text-primary'
										></i>
									</div>
									<span className='count bg-success'></span>
								</div>
								<div className='profile-name'>
									<h6 className='mb-0 font-weight-normal'>
										{auth.currentUser?.displayName}
									</h6>
									<span>{auth.currentUser?.email}</span>
								</div>
							</div>
							<Dropdown alignRight>
								<Dropdown.Toggle as='a' className='cursor-pointer no-caret'>
									<i className='mdi mdi-dots-vertical'></i>
								</Dropdown.Toggle>
								<Dropdown.Menu className='sidebar-dropdown preview-list'>
									<a
										href='!#'
										className='dropdown-item preview-item'
										onClick={(evt) => {
											evt.preventDefault();
											auth.signOut();
										}}
									>
										<div className='preview-thumbnail'>
											<div className='preview-icon bg-dark rounded-circle'>
												<i className='mdi mdi-logout text-danger'></i>
											</div>
										</div>
										<div className='preview-item-content'>
											<p className='preview-subject ellipsis mb-1 text-small'>
												Log Out
											</p>
										</div>
									</a>
									<div className='dropdown-divider'></div>
								</Dropdown.Menu>
							</Dropdown>
						</div>
					</li>
					<li className='nav-item nav-category'>
						<span className='nav-link'>
							<Trans>Navigation</Trans>
						</span>
					</li>
					<li
						className={
							this.isPathActive("/dashboard")
								? "nav-item menu-items active"
								: "nav-item menu-items"
						}
					>
						<Link className='nav-link' to='/dashboard'>
							<span className='menu-icon'>
								<i className='mdi mdi-view-dashboard'></i>
							</span>
							<span className='menu-title'>Dashboard</span>
						</Link>
					</li>
					<li
						className={
							this.isPathActive("/games")
								? "nav-item menu-items active"
								: "nav-item menu-items"
						}
					>
						<Link className='nav-link' to='/games'>
							<span className='menu-icon'>
								<i className='mdi mdi-gamepad-variant'></i>
							</span>
							<span className='menu-title'>Games</span>
						</Link>
					</li>
					<li
						className={
							this.isPathActive("/users")
								? "nav-item menu-items active"
								: "nav-item menu-items"
						}
					>
						<Link className='nav-link' to='/users'>
							<span className='menu-icon'>
								<i className='mdi mdi-account-multiple text-success'></i>
							</span>
							<span className='menu-title'>Users</span>
						</Link>
					</li>
					<li
						className={
							this.isPathActive("/profile")
								? "nav-item menu-items active"
								: "nav-item menu-items"
						}
					>
						<Link className='nav-link' to='/profile'>
							<span className='menu-icon'>
								<i className='mdi mdi-account-circle'></i>
							</span>
							<span className='menu-title'>Profile</span>
						</Link>
					</li>
					{/* <li
						className={
							this.isPathActive("/stats")
								? "nav-item menu-items active"
								: "nav-item menu-items"
						}
					>
						<Link className='nav-link' to='/stats'>
							<span className='menu-icon'>
								<i className='mdi mdi-speedometer'></i>
							</span>
							<span className='menu-title'>Stats</span>
						</Link>
					</li> */}
					<li onClick={this.logout} className='nav-item menu-items'>
						<span className='nav-link'>
							<span className='menu-icon'>
								<i className='mdi mdi-logout text-danger'></i>
							</span>
							<span style={{ color: "red" }} className='menu-title'>
								Log out
							</span>
						</span>
					</li>
				</ul>
			</nav>
		);
	}

	isPathActive(path) {
		return this.props.location.pathname.startsWith(path);
	}

	componentDidMount() {
		this.onRouteChanged();
		// add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
		const body = document.querySelector("body");
		document.querySelectorAll(".sidebar .nav-item").forEach((el) => {
			el.addEventListener("mouseover", function () {
				if (body.classList.contains("sidebar-icon-only")) {
					el.classList.add("hover-open");
				}
			});
			el.addEventListener("mouseout", function () {
				if (body.classList.contains("sidebar-icon-only")) {
					el.classList.remove("hover-open");
				}
			});
		});
	}
}

export default withRouter(AdminSidebar);
