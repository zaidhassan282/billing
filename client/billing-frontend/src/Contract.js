import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const downloadPDF = () => {
    const input = document.getElementById("contract");
    html2canvas(input, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = 210;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 5, 5, imgWidth - 10, imgHeight);
        pdf.save("contract.pdf");
    });
};

function Contract() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/entries/1")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) return (
        <div className="loading-container">
            <h2>Loading...</h2>
        </div>
    );

    return (
        <div className="contract-wrapper">
            <div id="contract">

                {/* HEADER */}
                <div className="contract-header">
                    <div className="header-left">
                        <div className="logo-box">LOGO</div>
                    </div>
                    <div className="header-center">
                        <h1 className="company-name">FINE FUSION TEXTILE</h1>
                        <p className="company-address">Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com</p>
                    </div>
                    <div className="header-right">
                        <p className="contract-type">SALE / SERVICE<br />CONTRACT</p>
                    </div>
                </div>

                <hr className="header-divider" />

                {/* CONTRACT SR.NO AND DATED */}
                <div className="contract-meta">
                    <div className="meta-field">
                        <label>CONTRACT SR. NO.</label>
                        <input type="text" defaultValue={`CNT-${data.id}`} readOnly />
                    </div>
                    <div className="meta-field">
                        <label>DATED</label>
                        <input type="text" defaultValue={data.dated} readOnly />
                    </div>
                </div>

                {/* CONTRACT INFORMATION */}
                <div className="section-container">
                    <h3 className="section-header">CONTRACT INFORMATION</h3>
                    <div className="info-grid">
                        <div className="info-row">
                            <div className="info-item">
                                <span className="label">Customer Name</span>
                                <div className="divider"></div>
                                <span className="value">{data.nameOfParty}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">GST Invoice</span>
                                <div className="divider"></div>
                                <span className="label">YES / NO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTRACT DETAILS */}
                <div className="section-container">
                    <h3 className="section-header">CONTRACT DETAILS</h3>
                    <div className="contract-details-grid">
                        <div className="detail-field">
                            <span className="label">H.S Code</span>
                            <div className="field-input">-</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Quantity / Description</span>
                            <div className="field-input">{data.description}</div>
                        </div>
                    </div>

                    <div className="contract-details-grid">
                        <div className="detail-field">
                            <span className="label">Fabric Type</span>
                            <div className="field-input">-</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Weight / Quantity</span>
                            <div className="field-input">{data.quantityKgBilled} Kg</div>
                        </div>
                    </div>

                    <div className="contract-details-grid-four">
                        <div className="detail-field">
                            <span className="label">Rate (PKR)</span>
                            <div className="field-input">{data.rate}</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Rate (PKR)</span>
                            <div className="field-input">{data.rate}</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Rate (PKR)</span>
                            <div className="field-input">{data.rate}</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Rate (PKR)</span>
                            <div className="field-input">{data.rate}</div>
                        </div>
                    </div>

                    <div className="contract-details-grid">
                        <div className="detail-field">
                            <span className="label">Quality Grade</span>
                            <div className="field-input">-</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Ghati Allowed %</span>
                            <div className="field-input">-</div>
                        </div>
                    </div>

                    <div className="contract-details-grid">
                        <div className="detail-field">
                            <span className="label">Delivery Time</span>
                            <div className="field-input">-</div>
                        </div>
                        <div className="detail-field">
                            <span className="label">Payment Terms</span>
                            <div className="field-input">Cash</div>
                        </div>
                    </div>
                </div>

                {/* TERMS & CONDITIONS */}
                <div className="section-container">
                    <h3 className="section-header">TERMS & CONDITIONS</h3>
                    <ol className="terms-list">
                        <li>Quality of goods shall be as per mutually agreed specifications. Any variation beyond Ghati Allowed % shall be subject to proportionate deduction.</li>
                        <li>Delivery time mentioned above is from the date of contract confirmation / receipt of advance payment.</li>
                        <li>Payment terms are binding and must be adhered to strictly. Late payment will attract a surcharge of 2% per month.</li>
                        <li>Goods once dispatched as per agreed quality will not be accepted back without prior written approval from Fine Fusion Textile.</li>
                        <li>Any dispute arising from the contract shall be subject to the jurisdiction of Karachi courts only.</li>
                    </ol>
                </div>

                {/* REMARKS & SPECIAL CONDITIONS */}
                <div className="section-container">
                    <h3 className="section-header remarks-header">REMARKS / SPECIAL CONDITIONS</h3>
                    <div className="remarks-box"></div>
                </div>

                {/* SIGNATURES */}
                <div className="signatures-section">
                    <div className="signature-field">
                        <div className="sig-label">PREPARED BY</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Name</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Designation</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Date</div>
                    </div>
                    <div className="signature-field">
                        <div className="sig-label">CUSTOMER ACCEPTANCE</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Name</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Stamp & Signature</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Date</div>
                    </div>
                    <div className="signature-field">
                        <div className="sig-label">AUTHORIZED SIGNATORY</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Name</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Designation</div>
                        <div className="sig-line"></div>
                        <div className="sig-detail">Date</div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="contract-footer">
                    <p>This contract is legally binding upon both parties once duly executed. Fine Fusion Textile | Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223</p>
                </div>

                {/* BUTTON SECTION */}
                <div className="button-section">
                    <button className="btn-primary" onClick={() => window.print()}>
                        Print Contract
                    </button>
                    <button className="btn-success" onClick={downloadPDF}>
                        Download PDF
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Contract;