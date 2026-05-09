import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddParty.css";
import Toast from "./Toast";
import { API_URL } from "./config";

function AddContract() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dated: "",
    contractNo: "",
    partyCode: "",
    nameOfParty: "",
    gstInvoiceYesNo: "",
    hsCode: "",
    quality: "",
    weight: "",
    rateA: "",
    rateB: "",
    shrinkage: "",
    deliveryTime: "",
    paymentTerm: ""
  });

  const [existingContracts, setExistingContracts] = useState([]);
  const [permanentTableData, setPermanentTableData] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Auto-generate Contract ID → CNT + YY + 3-digit sequence (e.g. CNT26001)
  const generateContractId = (existingData) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const yearPrefix = `CNT${year}`;

    const existingNums = existingData
      .map(d => d.contractNo || "")
      .filter(code => code.startsWith(yearPrefix))
      .map(code => parseInt(code.slice(yearPrefix.length), 10) || 0);

    const nextSeq = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `${yearPrefix}${nextSeq.toString().padStart(3, "0")}`;
  };

  // 🔹 Fetch existing contracts and permanent table data on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/contracts-table`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/permanent-table`).then(res => res.json()).catch(() => [])
    ]).then(([contracts, parties]) => {
      setExistingContracts(contracts);
      setPermanentTableData(parties);
      const newId = generateContractId(contracts);
      setFormData(prev => ({ 
        ...prev, 
        contractNo: newId,
        dated: new Date().toISOString().split('T')[0]
      }));
    });
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle party selection from dropdown
  const handlePartySelect = (e) => {
    const selectedPartyCode = e.target.value;
    const selectedParty = permanentTableData.find(p => p.partyCode === selectedPartyCode);
    
    if (selectedParty) {
      setFormData(prev => ({
        ...prev,
        partyCode: selectedParty.partyCode || "",
        nameOfParty: selectedParty.nameOfParty || "",
        gstInvoiceYesNo: selectedParty.gstInvoice || ""
      }));
    }
  };

  // 🔹 Reset form except Contract No and Date
  const handleReset = () => {
    const newId = generateContractId(existingContracts);
    setFormData({
      dated: new Date().toISOString().split('T')[0],
      contractNo: newId,
      partyCode: "",
      nameOfParty: "",
      gstInvoiceYesNo: "",
      hsCode: "",
      quality: "",
      weight: "",
      rateA: "",
      rateB: "",
      shrinkage: "",
      deliveryTime: "",
      paymentTerm: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.nameOfParty.trim()) {
      showToast("Party name is required", "error");
      return;
    }

    if (!formData.contractNo.trim()) {
      showToast("Contract number is required", "error");
      return;
    }

    // Check for duplicate contract number
    const isDuplicate = existingContracts.some(c => c.contractNo === formData.contractNo);
    if (isDuplicate) {
      showToast(`Contract No. "${formData.contractNo}" already exists`, "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/contracts-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect to the contracts table with a success toast
        navigate("/contracts", {
          state: {
            toast: {
              message: `Contract ${formData.contractNo} added successfully`,
              type: "success"
            }
          }
        });
      } else {
        const errorText = await response.text();
        showToast(errorText || "Failed to add contract", "error");
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
          <h1>Add New Contract</h1>
          <p>Create a new contract entry · Contract ID is auto-generated</p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-party-form">

          {/* SECTION 1: CONTRACT INFORMATION */}
          <div className="form-section">
            <h3>Contract Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contractNo">Contract No. <span className="required">*</span> <small style={{ color: "#888", fontWeight: 400 }}>(auto-generated)</small></label>
                <input
                  type="text"
                  id="contractNo"
                  name="contractNo"
                  value={formData.contractNo}
                  readOnly
                  style={{
                    backgroundColor: "#eef2ff",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    letterSpacing: "0.5px",
                    cursor: "not-allowed"
                  }}
                  title="Auto-generated unique Contract ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dated">Dated <span className="required">*</span></label>
                <input
                  type="date"
                  id="dated"
                  name="dated"
                  value={formData.dated}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="partyCode">Party Code</label>
                <input
                  type="text"
                  id="partyCode"
                  name="partyCode"
                  value={formData.partyCode}
                  readOnly
                  style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                  placeholder="Select party below to auto-fill"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nameOfParty">Party Name <span className="required">*</span></label>
                <select
                  id="nameOfParty"
                  value={formData.partyCode}
                  onChange={handlePartySelect}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Party</option>
                  {permanentTableData.map((party, idx) => (
                    <option key={idx} value={party.partyCode}>
                      {party.nameOfParty} ({party.partyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gstInvoiceYesNo">GST Invoice</label>
                <select
                  id="gstInvoiceYesNo"
                  name="gstInvoiceYesNo"
                  value={formData.gstInvoiceYesNo}
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

          {/* SECTION 2: CONTRACT DETAILS */}
          <div className="form-section">
            <h3>Contract Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="hsCode">H.S. Code</label>
                <input
                  type="text"
                  id="hsCode"
                  name="hsCode"
                  value={formData.hsCode}
                  onChange={handleChange}
                  placeholder="Enter H.S. Code"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quality">Quality / Description</label>
                <input
                  type="text"
                  id="quality"
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  placeholder="Enter quality or description"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="weight">Weight / Quantity</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight or quantity"
                  disabled={isLoading}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rateA">Rate A</label>
                <input
                  type="number"
                  id="rateA"
                  name="rateA"
                  value={formData.rateA}
                  onChange={handleChange}
                  placeholder="Enter rate A"
                  disabled={isLoading}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rateB">Rate B</label>
                <input
                  type="number"
                  id="rateB"
                  name="rateB"
                  value={formData.rateB}
                  onChange={handleChange}
                  placeholder="Enter rate B"
                  disabled={isLoading}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shrinkage">Shrinkage %</label>
                <input
                  type="number"
                  id="shrinkage"
                  name="shrinkage"
                  value={formData.shrinkage}
                  onChange={handleChange}
                  placeholder="Enter shrinkage percentage"
                  disabled={isLoading}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryTime">Delivery Time</label>
                <input
                  type="text"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="Enter delivery time"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentTerm">Payment Term</label>
                <input
                  type="text"
                  id="paymentTerm"
                  name="paymentTerm"
                  value={formData.paymentTerm}
                  onChange={handleChange}
                  placeholder="Enter payment term"
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
              onClick={() => navigate("/contracts")}
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

export default AddContract;
