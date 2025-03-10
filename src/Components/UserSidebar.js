import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { auth } from "../firebase";

class UserSidebar extends Component {
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
      <div className=" ">
        <nav
          style={{ minHeight: "100vh" }}
          className="sidebar sidebar-offcanvas"
          id="sidebar"
        >
          <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
            <Link className="sidebar-brand brand-logo" href="/dashboard">
              <img
                src={require("../assets/images/LogoRectangle.png")}
                alt="logo"
              />
            </Link>
            <Link className="sidebar-brand brand-logo-mini" href="/dashboard">
              <img
                src={require("../assets/images/LogoRectangle.png")}
                alt="logo"
              />
            </Link>
          </div>
          <ul className="nav">
            {/* <li className='nav-item profile'>
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
										onClick={(evt) => evt.preventDefault()}
									>
										<div className='preview-thumbnail'>
											<div className='preview-icon bg-dark rounded-circle'>
												<i className='mdi mdi-settings text-primary'></i>
											</div>
										</div>
										<div className='preview-item-content'>
											<Link className='no_link_style' to='/settings'>
												<p className='preview-subject ellipsis mb-1 text-small no_link_style'>
													Account Settings
												</p>
											</Link>
										</div>
									</a>
									<div className='dropdown-divider'></div>
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
					</li> */}
            <li
              className={
                this.isPathActive("/dashboard")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/dashboard">
                <span className="menu-icon">
                  <i className="mdi mdi-view-dashboard"></i>
                </span>
                <span className="menu-title">Dashboard</span>
              </Link>
            </li>
            <li
              className={
                this.isPathActive("/profile")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/profile">
                <span className="menu-icon">
                  <i className="mdi mdi-account-circle"></i>
                </span>
                <span className="menu-title">Profile</span>
              </Link>
            </li>
            <li
              className={
                this.isPathActive("/subscription")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/subscription">
                <span className="menu-icon">
                  <i className="mdi mdi-account-circle"></i>
                </span>
                <span className="menu-title">Subscription</span>
              </Link>
            </li>
            {/* <li
              className={
                this.isPathActive("/invoices")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/invoices">
                <span className="menu-icon">
                  <i className="mdi mdi-account-circle"></i>
                </span>
                <span className="menu-title">Invoices</span>
              </Link>
            </li> */}
            <li
              className={
                this.isPathActive("/settings")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/settings">
                <span className="menu-icon">
                  <i className="mdi mdi-settings text-success"></i>
                </span>
                <span className="menu-title">Settings</span>
              </Link>
            </li>
            {/* <li
              className={
                this.isPathActive("/cardDetails")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/cardDetails">
                <span className="menu-icon">
                <i className="mdi mdi-credit-card"></i>
                </span>
                <span className="menu-title">Update Card</span>
              </Link>
            </li> */}
            <li
              className={
                this.isPathActive("/status")
                  ? "nav-item menu-items active"
                  : "nav-item menu-items"
              }
            >
              <Link className="nav-link" to="/status">
                <span className="menu-icon">
                  <i className="mdi mdi-television text-primary"></i>
                </span>
                <span className="menu-title">Tv App Status</span>
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
            <li className="nav-item menu-items">
              <a href="/" onClick={this.logout}>
                <span className="nav-link">
                  <span className="menu-icon">
                    <i className="mdi mdi-logout text-danger"></i>
                  </span>
                  <span className="menu-title log_out">Log out</span>
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
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

export default withRouter(UserSidebar);
