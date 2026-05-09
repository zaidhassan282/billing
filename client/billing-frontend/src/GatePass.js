import React, { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Toast from "./Toast";
import "./GatePass.css";
import { API_URL } from "./config";

const getListEndpoint = (type) =>
    type === "inward"
        ? `${API_URL}/inward`
        : `${API_URL}/outward`;

const getSaveEndpoint = (type) =>
    type === "inward"
        ? `${API_URL}/inward/save`
        : `${API_URL}/outward/save`;

const getGatePassNumber = (gatepass) =>
    gatepass?.inwardId || gatepass?.outwardId || "";

const getPartyName = (gatepass, isInward) =>
    isInward
        ? gatepass?.nameOfParty || gatepass?.customerName || ""
        : gatepass?.customerName || gatepass?.nameOfParty || "";

const toNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatTotal = (value) => value.toFixed(2);

function GatePass() {
    const [gatepassType, setGatepassType] = useState("inward");
    const [gatepassList, setGatepassList] = useState([]);
    const [selectedGatepass, setSelectedGatepass] = useState(null);
    const [selectedGatepassIndex, setSelectedGatepassIndex] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formData, setFormData] = useState({});

    const showToast = useCallback((message, type = "success", duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const loadGatepasses = useCallback(async (type) => {
        setLoading(true);
        setSelectedGatepass(null);
        setSelectedGatepassIndex("");
        setFormData({});

        try {
            const response = await fetch(getListEndpoint(type));
            if (!response.ok) {
                throw new Error("Failed to load gate passes");
            }

            const data = await response.json();
            const nextGatepasses = Array.isArray(data) ? data : [];
            setGatepassList(nextGatepasses);

            if (nextGatepasses.length > 0) {
                setSelectedGatepass(nextGatepasses[0]);
                setSelectedGatepassIndex("0");
                setFormData(nextGatepasses[0]);
            }
        } catch (err) {
            setGatepassList([]);
            showToast(`Error: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadGatepasses("inward");
    }, [loadGatepasses]);

    const handleTypeChange = (type) => {
        setGatepassType(type);
        loadGatepasses(type);
    };

    const handleGatepassSelect = (value) => {
        if (value === "") {
            setSelectedGatepass(null);
            setSelectedGatepassIndex("");
            setFormData({});
            return;
        }

        const nextGatepass = gatepassList[Number.parseInt(value, 10)];
        if (!nextGatepass) {
            return;
        }

        setSelectedGatepass(nextGatepass);
        setSelectedGatepassIndex(value);
        setFormData(nextGatepass);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveGatePass = async () => {
        setSaving(true);
        try {
            const response = await fetch(getSaveEndpoint(gatepassType), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                let message = "Failed to save gate pass";
                try {
                    const error = await response.json();
                    message = error.message || message;
                } catch {
                    // Ignore JSON parsing failures and keep the fallback message.
                }
                throw new Error(message);
            }

            const result = await response.json();
            setSelectedGatepass(result);
            setFormData(result);
            setGatepassList(prev => {
                const next = [...prev];
                const index = Number.parseInt(selectedGatepassIndex, 10);

                if (!Number.isNaN(index) && next[index]) {
                    next[index] = result;
                    return next;
                }

                return [result, ...next];
            });
            if (selectedGatepassIndex === "") {
                setSelectedGatepassIndex("0");
            }
            showToast("Gate Pass saved successfully!", "success");
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            setSaving(false);
        }
    };

    const downloadPDF = () => {
        try {
            const input = document.getElementById("gatepass");
            if (!input) {
                showToast("Cannot find gate pass to export", "error");
                return;
            }

            html2canvas(input, { scale: 3 }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pageWidth = 210;
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, "PNG", 5, 5, imgWidth - 10, imgHeight);

                const fileName = `${gatepassType}-gatepass-${getGatePassNumber(formData) || "document"}.pdf`;
                pdf.save(fileName);
                showToast(`PDF downloaded as ${fileName}`, "success");
            }).catch(err => {
                showToast(`Error creating PDF: ${err.message}`, "error");
            });
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        }
    };

    const handlePrint = () => {
        try {
            window.print();
            showToast("Print dialog opened", "info");
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        }
    };

    const isInward = gatepassType === "inward";
    const currentGatepass = selectedGatepass ? formData : null;
    const items = Array.isArray(currentGatepass?.items) ? currentGatepass.items : [];
    const totals = items.reduce((accumulator, item) => ({
        roll: accumulator.roll + toNumber(item.roll),
        kg: accumulator.kg + toNumber(item.kg),
        meters: accumulator.meters + toNumber(item.meters)
    }), { roll: 0, kg: 0, meters: 0 });

    return (
        <div className="gatepass-wrapper">
            <div className="page-selector">
                <button onClick={() => handleTypeChange("inward")} className={isInward ? "active" : ""}>
                    Inward Gate Pass
                </button>
                <button onClick={() => handleTypeChange("outward")} className={!isInward ? "active" : ""}>
                    Outward Gate Pass
                </button>
                {gatepassList.length > 0 && (
                    <select
                        value={selectedGatepassIndex}
                        onChange={e => handleGatepassSelect(e.target.value)}
                    >
                        <option value="">Select a gate pass</option>
                        {gatepassList.map((item, idx) => (
                            <option key={item.id || `${item.contractNo}-${idx}`} value={idx}>
                                {getGatePassNumber(item)} - {item.contractNo}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {loading && !selectedGatepass ? (
                <div className="loading-container">
                    <h2>Loading...</h2>
                </div>
            ) : !selectedGatepass ? (
                <div className="loading-container">
                    <h2>No gate passes found.</h2>
                </div>
            ) : (
                <div id="gatepass">
                    <div className="gatepass-header">
                        <div className="header-left">
                            <div className="logo-box">LOGO</div>
                            <p className="company-name-small">FINE FUSION<br />TEXTILE</p>
                        </div>
                        <div className="header-center">
                            <h1 className="company-name-large">FINE FUSION TEXTILE</h1>
                            <p className="company-address-header">
                                Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
                            </p>
                        </div>
                        <div className="header-right">
                            <div className="gatepass-box">
                                <h2 className="gatepass-title">
                                    {isInward ? "INWARD" : "OUTWARD"} GATE PASS
                                </h2>
                                <div className="gatepass-field">
                                    <label>GATE PASS NO.</label>
                                    <input
                                        type="text"
                                        value={getGatePassNumber(currentGatepass)}
                                        readOnly
                                    />
                                </div>
                                <div className="gatepass-field">
                                    <label>DATE</label>
                                    <input
                                        type="text"
                                        value={currentGatepass?.dated || ""}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="gatepass-header-divider" />

                    <div className="details-section">
                        <div className="details-section-title">
                            {isInward ? "PARTY / DETAILS" : "CUSTOMER / PARTY DETAILS"}
                        </div>
                        <div className="details-grid">
                            <div className="detail-field">
                                <label>{isInward ? "Supplier / Party Name" : "Customer / Party Name"}</label>
                                <input
                                    type="text"
                                    value={getPartyName(currentGatepass, isInward)}
                                    onChange={(e) => handleFormChange(isInward ? "nameOfParty" : "customerName", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                            <div className="detail-field">
                                <label>Contract No</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.contractNo || ""}
                                    onChange={(e) => handleFormChange("contractNo", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>

                            <div className="detail-field">
                                <label>{isInward ? "Received From (Address)" : "Delivery Address"}</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.address || ""}
                                    onChange={(e) => handleFormChange("address", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                            <div className="detail-field">
                                <label>Vehicle No. / Transporter</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.vehicleNo || ""}
                                    onChange={(e) => handleFormChange("vehicleNo", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>

                            <div className="detail-field">
                                <label>Customer Lot No</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.customerLotNo || ""}
                                    onChange={(e) => handleFormChange("customerLotNo", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                            <div className="detail-field">
                                <label>Driver Name / Contact</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.driverName || ""}
                                    onChange={(e) => handleFormChange("driverName", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>

                            <div className="detail-field">
                                <label>Factory Lot No</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.factoryLotNo || ""}
                                    onChange={(e) => handleFormChange("factoryLotNo", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                            <div className="detail-field">
                                <label>{isInward ? "Reference Challan / PO No" : "Reference Invoice No"}</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.referenceNo || ""}
                                    onChange={(e) => handleFormChange("referenceNo", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="fabric-table-section">
                        <div className="fabric-table-title">FABRIC DETAILS</div>
                        {isInward && (
                            <div className="fabric-type-selector">
                                <label className="fabric-type-label">
                                    <input
                                        type="checkbox"
                                        checked={currentGatepass?.isDyedFabric === true}
                                        onChange={(e) => handleFormChange("isDyedFabric", e.target.checked)}
                                    />
                                    Dyed Fabric
                                </label>
                                <label className="fabric-type-label">
                                    <input
                                        type="checkbox"
                                        checked={currentGatepass?.isGreigeFabric === true}
                                        onChange={(e) => handleFormChange("isGreigeFabric", e.target.checked)}
                                    />
                                    Greige Fabric
                                </label>
                            </div>
                        )}
                        <table className="gatepass-table">
                            <thead>
                                <tr>
                                    <th className="col-sno">#</th>
                                    <th className="col-description">Description / Quality</th>
                                    <th className="col-lot1">Color / Shade</th>
                                    <th className="col-unit">Design / Article</th>
                                    <th className="col-qty">No. of Rolls/Bags</th>
                                    <th className="col-qty">Weight (KGs)</th>
                                    <th className="col-remarks">Meters / Yards</th>
                                    <th className="col-remarks">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="col-sno">{i + 1}</td>
                                            <td className="col-description">{item.quality || "-"}</td>
                                            <td className="col-lot1">{item.color || "-"}</td>
                                            <td className="col-unit">{item.article || "-"}</td>
                                            <td className="col-qty">{item.roll || "-"}</td>
                                            <td className="col-qty">{item.kg || "-"}</td>
                                            <td className="col-remarks">{item.meters || "-"}</td>
                                            <td className="col-remarks">{item.remarks || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    [...Array(10)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="col-sno">{i + 1}</td>
                                            <td className="col-description"></td>
                                            <td className="col-lot1"></td>
                                            <td className="col-unit"></td>
                                            <td className="col-qty"></td>
                                            <td className="col-qty"></td>
                                            <td className="col-remarks"></td>
                                            <td className="col-remarks"></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="table-totals">
                                    <td colSpan="4" style={{ textAlign: "right", fontWeight: "bold" }}>
                                        TOTAL
                                    </td>
                                    <td className="col-qty">{formatTotal(totals.roll)}</td>
                                    <td className="col-qty">{formatTotal(totals.kg)}</td>
                                    <td className="col-remarks">{formatTotal(totals.meters)}</td>
                                    <td className="col-remarks"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="security-section">
                        <div className="security-title">SECURITY / GATE CHECKING</div>
                        <div className="security-grid">
                            <div className="security-field">
                                <label>{isInward ? "Gate In Time" : "Gate Out Time"}</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.gateTime || ""}
                                    onChange={(e) => handleFormChange("gateTime", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                            <div className="security-field">
                                <label>Security Guard Name</label>
                                <input
                                    type="text"
                                    value={currentGatepass?.securityGuardName || ""}
                                    onChange={(e) => handleFormChange("securityGuardName", e.target.value)}
                                    placeholder="[Placeholder]"
                                />
                            </div>
                        </div>
                        <div className="security-field" style={{ marginBottom: "15px" }}>
                            <label>{isInward ? "Received & Checked by" : "Checked by (Store)"}</label>
                            <input
                                type="text"
                                value={currentGatepass?.checkedBy || ""}
                                onChange={(e) => handleFormChange("checkedBy", e.target.value)}
                                placeholder="[Placeholder]"
                            />
                        </div>
                    </div>

                    <div className="signature-section">
                        <div className="signature-box">
                            <div className="signature-box-title">Received By</div>
                            <div className="signature-area"></div>
                            <div className="signature-name">Name: _____________</div>
                            <div className="signature-name">Designation & Stamp</div>
                            <div className="signature-name">Date: _____________</div>
                        </div>
                        <div className="signature-box">
                            <div className="signature-box-title">{isInward ? "Store / Warehouse" : "Issued By"}</div>
                            <div className="signature-area"></div>
                            <div className="signature-name">Name: _____________</div>
                            <div className="signature-name">Signature:</div>
                            <div className="signature-name">Date: _____________</div>
                        </div>
                        <div className="signature-box">
                            <div className="signature-box-title">Authorized Signatory</div>
                            <div className="signature-area"></div>
                            <div className="signature-name">Name: _____________</div>
                            <div className="signature-name">Designation & Stamp</div>
                            <div className="signature-name">Date: _____________</div>
                        </div>
                    </div>

                    <div className="button-section">
                        <button className="btn-primary" onClick={saveGatePass} disabled={saving}>
                            {saving ? "Saving..." : "Save Gate Pass"}
                        </button>
                        <button className="btn-primary" onClick={handlePrint}>
                            Print
                        </button>
                        <button className="btn-success" onClick={downloadPDF}>
                            Download PDF
                        </button>
                    </div>
                </div>
            )}

            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} />
            ))}
        </div>
    );
}

export default GatePass;
