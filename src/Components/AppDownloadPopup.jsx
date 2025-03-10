import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import androidBCode from "../assets/images/android.png";
import iosBCode from "../assets/images/ios.png";
import iosBlack from "../assets/images/iosBlack.png";
import playBlack from "../assets/images/playBlack.png";

export default function AppDownloadPopup({ show, handleClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(show); // Control modal visibility properly

  useEffect(() => {
    const dontShow = localStorage.getItem("dontShowAppDownload");

    // Ensure it only hides if the user explicitly chose "Don't show again"
    if (dontShow === "true") {
      setIsVisible(false);
    } else {
      setIsVisible(show); // Properly show the modal
    }
  }, [show]); // Depend on `show` prop to update state correctly

  const handleCheckboxChange = () => {
    setDontShowAgain(!dontShowAgain);
  };

  const handleConfirmClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("dontShowAppDownload", "true");
    }
    setIsVisible(false); //  Hide popup when closing
    handleClose();
  };

  return (
    <Modal show={isVisible} onHide={handleConfirmClose} centered>
      <Modal.Header closeButton style={{ backgroundColor: "#fff", color: "#000" }}>
        <Modal.Title className="text-center w-100">Download BeyondLotto App for Cell Phone</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center" style={{ backgroundColor: "#fff", color: "#000" }}>
        <p>Click on the button below or scan the QR code to download.</p>
        <div className="d-flex justify-content-center gap-4">
          <div className="text-center">
            <img
              src={iosBCode}
              alt="iOS QR Code"
              className="img-fluid mb-3 mt-3"
              style={{ maxHeight: "138px" }}
            />
            <a
              href="https://apps.apple.com/us/app/beyond-lottery/id6477274005"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={iosBlack}
                alt="Download on App Store"
                className="img-fluid"
                style={{ maxHeight: "40px" }}
              />
            </a>
          </div>
          <div className="text-center">
            <img
              src={androidBCode}
              alt="Android QR Code"
              className="img-fluid mb-3 mt-3"
              style={{ maxHeight: "138px" }}
            />
            <a
              href="https://play.google.com/store/apps/details?id=com.dueta.inventorybeyondlotto"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={playBlack}
                alt="Get it on Google Play"
                className="img-fluid"
                style={{ maxHeight: "40px" }}
              />
            </a>
          </div>
        </div>

        {/* Left-aligned, larger checkbox & text */}
        <Form.Group className="mt-4 d-flex align-items-center" style={{ fontSize: "18px", fontWeight: "bold" }}>
          <Form.Check
            type="checkbox"
            id="dont-show-again"
            checked={dontShowAgain}
            onChange={handleCheckboxChange}
            style={{ transform: "scale(1.5)" }} // Makes checkbox bigger
          />
          <Form.Label htmlFor="dont-show-again" className="ms-3 mb-0 mt-1 ml-2">
            Don't show again
          </Form.Label>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: "#fff" }}>
        <Button variant="dark" onClick={handleConfirmClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
