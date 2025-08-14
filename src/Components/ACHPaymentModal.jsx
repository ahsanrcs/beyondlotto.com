import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { showError, showSuccess } from "../utils/functions";
import stamp from "../assets/images/secure90x72.png";

const ACHPaymentModal = ({ showACHModal, setShowACHModal, plan, user, onSuccess  }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Authorize.Net Seal Script only once
    if (!document.getElementById("AuthorizeNetSealScript")) {
      const script = document.createElement("script");
      script.id = "AuthorizeNetSealScript";
      script.type = "text/javascript";
      script.text = 'var ANS_customer_id="ed039f04-6014-4d3e-b544-d1f869503973";';
      document.body.appendChild(script);

      const sealScript = document.createElement("script");
      sealScript.src = "//verify.authorize.net:443/anetseal/seal.js";
      sealScript.async = true;
      document.body.appendChild(sealScript);
    }

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const script = document.getElementById("AuthorizeNetSealScript");
      const sealScript = document.querySelector('script[src="//verify.authorize.net:443/anetseal/seal.js"]');
      if (script) document.body.removeChild(script);
      if (sealScript) document.body.removeChild(sealScript);
    };
  }, [])
  
  const handleACHSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const achData = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      nameOnAccount: formData.get("name_on_account"),
      routingNumber: formData.get("routing_number"),
      accountNumber: formData.get("account_number"),
      accountType: formData.get("account_type"), 
      planType: plan.name,
      userId: user.id,
      email: user.email,
    };
    
 //  Validate Routing Number (should be 9 digits)
 if (!/^\d{9}$/.test(achData.routingNumber)) {
  setLoading(false);
  showError("Invalid routing number. Please enter a 9-digit number.");
  return;
}

// Validate Account Number (should be between 6 and 17 digits)
if (!/^\d{6,17}$/.test(achData.accountNumber)) {
  setLoading(false);
  showError("Invalid account number. Please enter a valid bank account number.");
  return;
}
    // Securely tokenize ACH data using Accept.js
    const secureData = {
      authData: {
        clientKey: process.env.REACT_APP_AUTHORIZE_NET_CLIENT_KEY, // Ensure this is defined
        apiLoginID: process.env.REACT_APP_AUTHORIZE_NET_LOGIN_ID, // Ensure this is defined
      },
      bankData: {
        routingNumber: achData.routingNumber,
        accountNumber: achData.accountNumber,
        nameOnAccount: achData.nameOnAccount,
        accountType: achData.accountType, // Try specifying account type if required
      },
    };

    console.log("Secure Data:", secureData); // Log the secure data
    if (!window.Accept) {
      console.error("Accept.js is not loaded.");
      showError("Payment processing is currently unavailable. Please try again later.");
      return;
    }
    

    window.Accept.dispatchData(secureData, (response) => {
      console.log("Accept.js Response:", response);
      if (response.messages.resultCode === "Ok") {
        const opaqueData = response.opaqueData;
        console.log("Opaque Data:", opaqueData); //  Debug log
        sendTokenizedDataToServer(opaqueData, achData);
      } else {
        
        console.error("Tokenization failed:", response); // Log full response
        showError(response.messages.message[0].text || "Failed to tokenize ACH data.");
        setLoading(false);
      }

    });
    
    
  };

//   // 🔹 Function to delete the customer from Stripe
// const handleDelete = async () => {
//   try {
//     const res = await fetch(
//       "https://us-central1-beyondlottotv.cloudfunctions.net/deleteCustomer",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           c_id: user.customer_id,
//           userId: user.id,
//         }),
//       }
//     );

//     if (res.ok) {
//       // console.log("Customer deleted from Stripe.");
//     } else {
//       // console.error("Failed to delete customer from Stripe.");
//     }
//   } catch (e) {
//     // console.error("Error deleting customer from Stripe:", e);
//   }
// };
  // console.log("Client Key:", process.env.REACT_APP_AUTHORIZE_NET_CLIENT_KEY);
  // console.log("Login ID:", process.env.REACT_APP_AUTHORIZE_NET_LOGIN_ID);
  const sendTokenizedDataToServer = async (opaqueData, achData) => {
    try {
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + "/createAuthorizeSubscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Ensure JSON format
          },
          body: JSON.stringify({
            ...achData,
            opaqueData,
          }),
        }
      );
      

      if (res.ok) {
        showSuccess("Subscription created successfully");
        setShowACHModal(false); 
        onSuccess();
        //  // 🔹 If customer_id exists, delete customer from Stripe
        //  if (user.customer_id) {
        //   await handleDelete();
        // }
      } else {
        const errorData = await res.json();
        showError(errorData.message || "Failed to create subscription");
      } 
    } catch (e) {
      // console.error(e);
      showError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showACHModal} onHide={() => setShowACHModal(false)} centered>
  <Modal.Header closeButton style={{ background: "white", color: "black" }}>
    <Modal.Title>Plan {plan?.label} - ACH Payment</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ background: "white", color: "black", textAlign: "left", padding: "2rem" }}>
    <form onSubmit={handleACHSubmit}>
      
      {/* First Name & Last Name in One Row */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="first_name" className="form-label">First Name</label>
          <input type="text" className="form-control" id="first_name" name="first_name" required />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="last_name" className="form-label">Last Name</label>
          <input type="text" className="form-control" id="last_name" name="last_name" required />
        </div>
      </div>

      {/* Name on Account */}
      <div className="mb-3">
        <label htmlFor="name_on_account" className="form-label">Name on Bank Account</label>
        <input type="text" className="form-control" id="name_on_account" name="name_on_account" required />
      </div>

      {/* Routing & Account Number in One Row */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="routing_number" className="form-label">Routing Number</label>
          <input type="text" className="form-control" id="routing_number" name="routing_number" required />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="account_number" className="form-label">Account Number</label>
          <input type="text" className="form-control" id="account_number" name="account_number" required />
        </div>
      </div>

      {/* Account Type */}
<div className="mb-4">
  <label htmlFor="account_type" className="form-label fw-bold">
    Account Type
  </label>
  <select
    className="form-select p-3 rounded-3 border border-secondary"
    id="account_type"
    name="account_type"
    required
    style={{ fontSize: "1.1rem", cursor: "pointer" }}
  >
    <option value="checking">Checking</option>
    <option value="savings">Savings</option>
  </select>
</div>


      {/* Submit Button */}
      <div className="text-center">
        <button type="submit" className="btn btn-primary py-3 w-100" disabled={loading}>
          {loading ? "Processing..." : "Submit Payment"}
        </button>
      </div>
    </form>
    <div className="text-center mt-3">
        <div className="AuthorizeNetSeal">
          {/* <a
            href="https://verify.authorize.net/anetseal/?pid=ed039f04-6014-4d3e-b544-d1f869503973"
            target="_blank"
            rel="noopener noreferrer"
            id="AuthorizeNetSeal"
          > */}
            <img
              src={stamp}
              width="90"
              height="72"
              border="0"
              alt="Authorize.Net Merchant - Click to Verify"
            />
          {/* </a> */}
        </div>
        </div>

<div class="AuthorizeNetSeal"> <script type="text/javascript" language="javascript">var ANS_customer_id="ed039f04-6014-4d3e-b544-d1f869503973";</script> <script type="text/javascript" language="javascript" src="//verify.authorize.net:443/anetseal/seal.js" ></script> </div>
  </Modal.Body>
  <Modal.Footer style={{ background: "white", color: "black" }}>
    <button onClick={() => setShowACHModal(false)} className="btn py-3 btn-danger w-100">
      Close
    </button>
  </Modal.Footer>
</Modal>

  );
};

export default ACHPaymentModal;