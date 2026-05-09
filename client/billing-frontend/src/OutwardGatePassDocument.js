import React from "react";
import "./OutwardGatePass.css";

/**
 * Presentational component for the printable Outward Gate Pass.
 * Used by OutwardPreview and Logs DocumentPreview.
 */
function OutwardGatePassDocument({ form = {}, items = [], readOnly = false, onFormChange, onItemChange }) {

  const handleField = (field, value) => {
    if (!readOnly && onFormChange) onFormChange(field, value);
  };
  const handleItem = (i, field, value) => {
    if (!readOnly && onItemChange) onItemChange(i, field, value);
  };

  const fabricType = form.fabricType || "GREY";
  const passType = form.type || "DELIVERY";

  const calcTotal = (field) =>
    items.reduce((sum, it) => sum + (parseFloat(it[field]) || 0), 0).toFixed(2);

  const inputProps = readOnly ? { readOnly: true } : {};

  return (
    <div id="outward-gatepass-doc" className="ogp-doc">
      {/* HEADER */}
      <div className="ogp-header">
        <div className="ogp-header-left">
          <div className="ogp-logo-placeholder">
            <span className="ogp-logo-text">FINE<br />FUSION<br />TEXTILE</span>
            <small className="ogp-logo-hint">[ logo ]</small>
          </div>
          <div className="ogp-company-name"><strong>FINE FUSION TEXTILE</strong></div>
        </div>
        <div className="ogp-header-right">
          <h1 className="ogp-title">OUTWARD GATE PASS</h1>
        </div>
      </div>

      <div className="ogp-address-bar">
        Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
      </div>

      {/* PASS TYPE: DELIVERY / RETURN */}
      <div className="ogp-type-row">
        <div className="ogp-type-label">PASS TYPE</div>
        <label className={`ogp-radio-label ${passType === "DELIVERY" ? "active" : ""}`}>
          <input type="radio" name="passType" value="DELIVERY"
            checked={passType === "DELIVERY"} disabled={readOnly}
            onChange={() => handleField("type", "DELIVERY")} />
          <span className="ogp-radio-custom"></span><strong>DELIVERY</strong>
        </label>
        <label className={`ogp-radio-label ${passType === "RETURN" ? "active" : ""}`}>
          <input type="radio" name="passType" value="RETURN"
            checked={passType === "RETURN"} disabled={readOnly}
            onChange={() => handleField("type", "RETURN")} />
          <span className="ogp-radio-custom"></span><strong>RETURN</strong>
        </label>
      </div>

      {/* TOP FIELDS */}
      <div className="ogp-top-fields">
        <div className="ogp-top-field">
          <div className="ogp-top-label">GATE PASS NO.</div>
          <input type="text" className="ogp-top-input" value={form.gatePassNo || ""}
            onChange={e => handleField("gatePassNo", e.target.value)} {...inputProps} />
        </div>
        <div className="ogp-top-field">
          <div className="ogp-top-label">DATE</div>
          <input type="date" className="ogp-top-input" value={form.dated || ""}
            onChange={e => handleField("dated", e.target.value)} {...inputProps} />
        </div>
      </div>

      {/* PARTY / DETAILS */}
      <div className="ogp-section-header ogp-section-dark">PARTY / DETAILS</div>
      <div className="ogp-section-body">
        <Row label="Customer / Party Name" value={form.customerName || ""}
          onChange={v => handleField("customerName", v)} {...inputProps} />
        <Row label="Delivery Address" value={form.deliveryAddress || ""}
          onChange={v => handleField("deliveryAddress", v)} {...inputProps} />
        <Row label="Vehicle No. / Transporter" value={form.vehicleNo || ""}
          onChange={v => handleField("vehicleNo", v)} {...inputProps} />
        <Row label="Driver Name / Contact" value={form.driverName || ""}
          onChange={v => handleField("driverName", v)} {...inputProps} />
        <Row label="Reference Invoice No." value={form.referenceInvoice || ""}
          onChange={v => handleField("referenceInvoice", v)} {...inputProps} />
      </div>

      {/* FABRIC TYPE */}
      <div className="ogp-section-header ogp-section-green">FABRIC DETAILS</div>
      <div className="ogp-fabric-type-row">
        <div className="ogp-fabric-type-label">Fabric Type</div>
        <label className={`ogp-radio-label ${fabricType === "DYED" ? "active" : ""}`}>
          <input type="radio" name="fabricType" value="DYED"
            checked={fabricType === "DYED"} disabled={readOnly}
            onChange={() => handleField("fabricType", "DYED")} />
          <span className="ogp-radio-custom"></span><strong>DYED FABRIC</strong>
        </label>
        <label className={`ogp-radio-label ${fabricType === "GREY" ? "active" : ""}`}>
          <input type="radio" name="fabricType" value="GREY"
            checked={fabricType === "GREY"} disabled={readOnly}
            onChange={() => handleField("fabricType", "GREY")} />
          <span className="ogp-radio-custom"></span><strong>GREY FABRIC</strong>
        </label>
      </div>

      {/* ITEMS */}
      <table className="ogp-items-table">
        <thead>
          <tr>
            <th className="ogp-col-no">#</th>
            <th>Description / Quality</th>
            <th>Color / Shade</th>
            <th>Design / Article</th>
            <th>No. of Rolls/Bags</th>
            <th>Weight (KGs)</th>
            <th>Meters / Yards</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="ogp-col-no">{i + 1}</td>
              <td><input type="text" className="ogp-cell-input" value={it.description || ""}
                onChange={e => handleItem(i, "description", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="ogp-cell-input" value={it.color || ""}
                onChange={e => handleItem(i, "color", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="ogp-cell-input" value={it.design || ""}
                onChange={e => handleItem(i, "design", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="ogp-cell-input ogp-cell-number" value={it.rolls || ""}
                onChange={e => handleItem(i, "rolls", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="ogp-cell-input ogp-cell-number" value={it.weight || ""}
                onChange={e => handleItem(i, "weight", e.target.value)} {...inputProps} /></td>
              <td><input type="number" className="ogp-cell-input ogp-cell-number" value={it.meters || ""}
                onChange={e => handleItem(i, "meters", e.target.value)} {...inputProps} /></td>
              <td><input type="text" className="ogp-cell-input" value={it.remarks || ""}
                onChange={e => handleItem(i, "remarks", e.target.value)} {...inputProps} /></td>
            </tr>
          ))}
          <tr className="ogp-total-row">
            <td colSpan="4" className="ogp-total-label">TOTAL</td>
            <td className="ogp-total-value">{calcTotal("rolls")}</td>
            <td className="ogp-total-value">{calcTotal("weight")}</td>
            <td className="ogp-total-value">{calcTotal("meters")}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* SECURITY */}
      <div className="ogp-section-header ogp-section-dark">SECURITY / GATE CHECKING</div>
      <div className="ogp-section-body">
        <Row label="Gate Out Time" value={form.gateOutTime || ""}
          onChange={v => handleField("gateOutTime", v)} {...inputProps} />
        <Row label="Security Guard Name" value={form.securityGuard || ""}
          onChange={v => handleField("securityGuard", v)} {...inputProps} />
        <Row label="Checked By (Store)" value={form.checkedByStore || ""}
          onChange={v => handleField("checkedByStore", v)} {...inputProps} />
      </div>

      {/* SIGNATURES */}
      <div className="ogp-signatures">
        <SigBlock title="ISSUED BY"
          name={form.issuedByName} designation={form.issuedByDesignation} date={form.issuedByDate}
          onName={v => handleField("issuedByName", v)}
          onDesignation={v => handleField("issuedByDesignation", v)}
          onDate={v => handleField("issuedByDate", v)}
          designationLabel="Designation:" {...inputProps} />
        <SigBlock title="STORE / WAREHOUSE"
          name={form.storeName} designation={form.storeSignature} date={form.storeDate}
          onName={v => handleField("storeName", v)}
          onDesignation={v => handleField("storeSignature", v)}
          onDate={v => handleField("storeDate", v)}
          designationLabel="Signature:" {...inputProps} />
        <SigBlock title="AUTHORIZED SIGNATORY"
          name={form.authorizedName} designation={form.authorizedDesignation} date={form.authorizedDate}
          onName={v => handleField("authorizedName", v)}
          onDesignation={v => handleField("authorizedDesignation", v)}
          onDate={v => handleField("authorizedDate", v)}
          designationLabel="Designation & Stamp:" {...inputProps} />
      </div>

      <div className="ogp-footer-note">
        This gate-pass must be presented at the exit gate. Unauthorised removal of goods strictly prohibited. | Fine Fusion Textile
      </div>
    </div>
  );
}

function Row({ label, value, onChange, readOnly }) {
  return (
    <div className="ogp-row">
      <div className="ogp-row-label">{label}</div>
      <input type="text" className="ogp-row-input" value={value || ""}
        onChange={e => onChange(e.target.value)} readOnly={readOnly} />
    </div>
  );
}

function SigBlock({ title, name, designation, date, designationLabel,
                    onName, onDesignation, onDate, readOnly }) {
  return (
    <div className="ogp-signature-col">
      <div className="ogp-signature-header">{title}</div>
      <div className="ogp-signature-body">
        <div className="ogp-sig-line">
          <span className="ogp-sig-label">Name:</span>
          <input type="text" className="ogp-sig-input" value={name || ""}
            onChange={e => onName(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="ogp-sig-line">
          <span className="ogp-sig-label">{designationLabel}</span>
          <input type="text" className="ogp-sig-input" value={designation || ""}
            onChange={e => onDesignation(e.target.value)} readOnly={readOnly} />
        </div>
        <div className="ogp-sig-line">
          <span className="ogp-sig-label">Date:</span>
          <input type="text" className="ogp-sig-input" value={date || ""}
            onChange={e => onDate(e.target.value)} readOnly={readOnly} />
        </div>
      </div>
    </div>
  );
}

export default OutwardGatePassDocument;
