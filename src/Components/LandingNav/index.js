import React, { useEffect, useState } from "react";
import { Flex } from "../../styles/global.syles";
import { NavbarContainer } from "./Navbar.styles";
import logo from "../../images/logo.png";
import { FaBars, FaTimes, FaGooglePlay, FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import android from "../../images/android.png";

const Navbar = () => {
  const [isFixed, setIsFixed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [shownav, setShownav] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", (e) => {
      console.log(document.documentElement.scrollTop);
      if (
        (document.body.scrollTop > 100 && document.body.scrollTop <= 300) ||
        (document.documentElement.scrollTop > 100 &&
          document.documentElement.scrollTop <= 300)
      ) {
        setIsFixed(true);
        setShouldShow(false);
      } else if (
        document.body.scrollTop > 300 ||
        document.documentElement.scrollTop > 300
      ) {
        setShouldShow(true);
      } else {
        setIsFixed(false);
        setShouldShow(false);
      }
    });
  }, []);

  return (
    <NavbarContainer
      isFixed={isFixed}
      shouldShow={shouldShow}
      shownav={shownav}
    >
      <div className="container">
        <Flex justify="space-between">
          {/* logo  */}
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="" />
            </Link>
          </div>
          {/* links  */}
          <div className="links">
            <Flex gap="40px">
              <Link to="/">
                <a className="active">Home</a>
              </Link>
              <a href="#features">
                <a className="">Features</a>
              </a>
              <a href="#contact-us">
                <a className="">Contact us</a>
              </a>
              <a href="#download-app" style={{ textDecoration: "none" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span style={{ lineHeight: "1", textAlign: "center" }}>
                    Download
                  </span>
                  <FaApple
                    style={{
                      fontSize: "2em",
                      color: "black",
                      paddingBottom: "5px",
                    }}
                  />
                  {/* <FaGooglePlay style={{ fontSize: "1.2em", color: "blue" }} /> */}
                  <img src={android} alt="" width="30" height="30" />
                </div>
              </a>
              <Link target="_blank" to="/login">
                <button>Login</button>
              </Link>
            </Flex>
            {/* bars  */}
            <div
              className="bars"
              onClick={() => setShownav((prevState) => !prevState)}
            >
              {shownav ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </Flex>
      </div>
    </NavbarContainer>
  );
};

export default Navbar;
