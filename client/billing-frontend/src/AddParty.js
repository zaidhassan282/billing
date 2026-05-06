import React, { useState } from "react";
import "./AddParty.css";
import Toast from "./Toast";

function AddParty() {
  const [formData, setFormData] = useState({
    partyCode: "",
    nameOfParty: "",
    invoiceAddress: "",
    ntn: "",
    gstInvoice: "",
    deliveryAddress1: "",
    deliveryAddress2: "",
    deliveryAddress3: ""
  });

  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFormData({
      partyCode: "",
      nameOfParty: "",
      invoiceAddress: "",
      ntn: "",
      gstInvoice: "",
      deliveryAddress1: "",
      deliveryAddress2: "",
      deliveryAddress3: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nameOfParty.trim()) {
      showToast("Party name is required", "error");
      return;
    }

    if (!formData.ntn.trim()) {
      showToast("NTN is required", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/permanent-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast("Party added successfully!", "success");
        handleReset();
      } else {
        showToast("Failed to add party. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-party-page">
      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="add-party-header">
        <div className="header-content">
          <h1>Add New Party</h1>
          <p>Create a new party entry in the permanent party table</p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-party-form">

          {/* SECTION 1: BASIC INFORMATION */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="partyCode">Party Code</label>
                <input
                  type="text"
                  id="partyCode"
                  name="partyCode"
                  value={formData.partyCode}
                  onChange={handleChange}
                  placeholder="Enter party code"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nameOfParty">Party Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="nameOfParty"
                  name="nameOfParty"
                  value={formData.nameOfParty}
                  onChange={handleChange}
                  placeholder="Enter party name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ntn">NTN <span className="required">*</span></label>
                <input
                  type="text"
                  id="ntn"
                  name="ntn"
                  value={formData.ntn}
                  onChange={handleChange}
                  placeholder="Enter NTN"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gstInvoice">GST Invoice</label>
                <select
                  id="gstInvoice"
                  name="gstInvoice"
                  value={formData.gstInvoice}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select GST Status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESSES */}
          <div className="form-section">
            <h3>Addresses</h3>
            <div className="form-group full-width">
              <label htmlFor="invoiceAddress">Invoice Address</label>
              <input
                type="text"
                id="invoiceAddress"
                name="invoiceAddress"
                value={formData.invoiceAddress}
                onChange={handleChange}
                placeholder="Enter invoice address"
                disabled={isLoading}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="deliveryAddress1">Delivery Address 1</label>
                <input
                  type="text"
                  id="deliveryAddress1"
                  name="deliveryAddress1"
                  value={formData.deliveryAddress1}
                  onChange={handleChange}
                  placeholder="Enter delivery address 1"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryAddress2">Delivery Address 2</label>
                <input
                  type="text"
                  id="deliveryAddress2"
                  name="deliveryAddress2"
                  value={formData.deliveryAddress2}
                  onChange={handleChange}
                  placeholder="Enter delivery address 2"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryAddress3">Delivery Address 3</label>
                <input
                  type="text"
                  id="deliveryAddress3"
                  name="deliveryAddress3"
                  value={formData.deliveryAddress3}
                  onChange={handleChange}
                  placeholder="Enter delivery address 3"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* FORM BUTTONS */}
          <div className="form-buttons">
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Party"}
            </button>
            <button
              type="reset"
              className="btn-reset"
              onClick={handleReset}
              disabled={isLoading}
            >
              Clear Form
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddParty;
