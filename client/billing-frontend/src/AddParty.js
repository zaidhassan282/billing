import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddParty.css";
import Toast from "./Toast";
import { API_URL } from "./config";

function AddParty() {
  const navigate = useNavigate();

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

  const [existingParties, setExistingParties] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Auto-generate Party ID  →  P + YY + 3-digit sequence  (e.g. P26001)
  const generatePartyId = (existingData) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const yearPrefix = `P${year}`;

    const existingNums = existingData
      .map(d => d.partyCode || "")
      .filter(code => code.startsWith(yearPrefix))
      .map(code => parseInt(code.slice(yearPrefix.length), 10) || 0);

    const nextSeq = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `${yearPrefix}${nextSeq.toString().padStart(3, "0")}`;
  };

  // 🔹 Fetch existing parties on mount and auto-generate the next ID
  useEffect(() => {
    fetch(`${API_URL}/permanent-table`)
      .then(res => res.json())
      .then(parties => {
        setExistingParties(parties);
        const newId = generatePartyId(parties);
        setFormData(prev => ({ ...prev, partyCode: newId }));
      })
      .catch(err => {
        console.error(err);
        // fallback if backend fails
        setFormData(prev => ({ ...prev, partyCode: generatePartyId([]) }));
      });
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Reset everything except Party ID (regenerate it)
  const handleReset = () => {
    const newId = generatePartyId(existingParties);
    setFormData({
      partyCode: newId,
      nameOfParty: "",
      invoiceAddress: "",
      ntn: "",
      gstInvoice: "",
      deliveryAddress1: "",
      deliveryAddress2: "",
      deliveryAddress3: ""
    });
  };

  // 🔹 Duplicate check helper
  const findDuplicate = (field, value) => {
    if (!value) return null;
    return existingParties.find(
      p => p[field] && p[field].toString().toLowerCase() === value.toString().toLowerCase()
    );
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

    // Frontend duplicate check
    if (findDuplicate("nameOfParty", formData.nameOfParty)) {
      showToast(`Party Name "${formData.nameOfParty}" already exists`, "error");
      return;
    }
    if (findDuplicate("ntn", formData.ntn)) {
      showToast(`NTN "${formData.ntn}" already exists`, "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/permanent-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect to the table page with a success toast
        navigate("/permenant-table", {
          state: {
            toast: {
              message: `Party ${formData.partyCode} added successfully`,
              type: "success"
            }
          }
        });
      } else {
        const errorText = await response.text();
        showToast(errorText || "Failed to add party", "error");
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
          <p>Create a new party entry · Party ID is auto-generated</p>
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
                <label htmlFor="partyCode">Party ID <span className="required">*</span> <small style={{ color: "#888", fontWeight: 400 }}>(auto-generated)</small></label>
                <input
                  type="text"
                  id="partyCode"
                  name="partyCode"
                  value={formData.partyCode}
                  readOnly
                  style={{
                    backgroundColor: "#eef2ff",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    letterSpacing: "0.5px",
                    cursor: "not-allowed"
                  }}
                  title="Auto-generated unique Party ID"
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
              {isLoading ? "Adding..." : "Submit"}
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={isLoading}
            >
              Clear Form
            </button>
            <button
              type="button"
              className="btn-reset"
              onClick={() => navigate("/permenant-table")}
              disabled={isLoading}
              style={{ marginLeft: "auto" }}
            >
              ← Back to Table
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddParty;
