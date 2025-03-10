// AppDownload.js
import React from "react";
import appImage from "../assets/images/appBanner.png";
import androidBCode from "../assets/images/android.png";
import iosBCode from "../assets/images/ios.png";
import iosWhite from "../assets/images/iosWhite.png";
import iosBlack from "../assets/images/iosBlack.png";
import playWhite from "../assets/images/playWhite.png";
import playBlack from "../assets/images/playBlack.png";
import { Container, Row, Col } from "react-bootstrap";
import { FaGooglePlay, FaApple } from "react-icons/fa";

export default function AppDownload() {
	return (
		<div id="download-app" className="bg-light ">
			<Container>
				<Row className="align-items-center">
					<Col md={6} className="text-center">
						<img
							src={appImage}
							alt="App Preview"
							className="img-fluid bg-light"
							style={{ maxHeight: "620px"  }}
						/>
					</Col>
					<Col md={6} className="text-center text-md-start bg-light" >
						<h3 className="text-black my-4">Download our BeyondLotto App</h3>
						<p>Click on below button or scan the code</p>
						<div className="d-flex flex-row align-items-center justify-content-around gap-4 bg-light">
						<div className="d-flex flex-column align-items-center text-center">
								<img
									src={iosBCode}
									alt="iOS QR Code"
									className="img-fluid mb-4"
									style={{ maxHeight: "138px" }}
								/>
								<a
									href="https://apps.apple.com/us/app/beyond-lottery/id6477274005"
									target="_blank"
									rel="noopener noreferrer"
									className="d-flex align-items-center text-decoration-none"
								>
									{/* <FaApple size={40} className="me-2" />
									<span>App Store</span> */}
									<img
									src={iosBlack}
									alt="iOS QR Code"
									className="img-fluid mb-2"
									style={{ maxHeight: "40px" }}
								/>
								</a>
							</div>
							<div className="d-flex flex-column align-items-center text-center bg-light">
								<img
									src={androidBCode}
									alt="Android QR Code"
									className="img-fluid mb-4"
									style={{ maxHeight: "138px" }}
								/>
								<a
									href="https://play.google.com/store/apps/details?id=com.dueta.inventorybeyondlotto"
									target="_blank"
									rel="noopener noreferrer"
									className="d-flex align-items-center text-decoration-none"
								>
									{/* <FaGooglePlay size={40} className="me-2" />
									<span>Google Play</span> */}
									<img
									src={playBlack}
									alt="iOS QR Code"
									className="img-fluid mb-2"
									style={{ maxHeight: "40px" }}/>
								</a>
							</div>
							
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
