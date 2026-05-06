import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const downloadPDF = () => {
    const input = document.getElementById("invoice");

    html2canvas(input, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = 210;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 5, 5, imgWidth - 10, imgHeight);
        pdf.save("invoice.pdf");
    });
};

function Invoice() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/entries/1")
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
    }, []);

    if (!data) {
        return (
            <div className="loading-container">
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className="invoice-wrapper">
            <div id="invoice">
                <div className="invoice-header">
                    <div className="logo-placeholder">
                        LOGO
                    </div>

                    <div className="invoice-title">
                        <h2>COMMERCIAL INVOICE</h2>
                        <p>
                            Plot A-15/B, Binoria Chowk, SITE, Karachi | 0315-1113223 | finefusiontextile@gmail.com
                        </p>
                    </div>

                    <div style={{ width: "120px" }}></div>
                </div>

                <hr className="invoice-divider" />

                <div className="info-section">
                    <div className="info-box">
                        <h4>Bill To</h4>
                        <p>{data.nameOfParty}</p>
                        <p>Address: -</p>
                        <p>City: -</p>
                        <p>NTN: -</p>
                    </div>

                    <div className="info-box">
                        <h4>Invoice Details</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Invoice No</td>
                                    <td align="right">INV-{data.id}</td>
                                </tr>
                                <tr>
                                    <td>Date</td>
                                    <td align="right">{data.dated}</td>
                                </tr>
                                <tr>
                                    <td>Payment</td>
                                    <td align="right">Cash</td>
                                </tr>
                                <tr>
                                    <td>Sales Person</td>
                                    <td align="right">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Description</th>
                            <th>Lot</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>{data.serialNo}</td>
                            <td style={{ textAlign: "left" }}>{data.description}</td>
                            <td>-</td>
                            <td>{data.quantityKgBilled}</td>
                            <td>Kg</td>
                            <td>{data.rate}</td>
                            <td>{data.amount}</td>
                        </tr>
                    </tbody>
                </table>

                <hr className="invoice-divider" />

                <div className="totals-section">
                    <table className="totals-table">
                        <tbody>
                            <tr>
                                <td>Subtotal</td>
                                <td>{data.amount}</td>
                            </tr>
                            <tr>
                                <td>Discount</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>Sales Tax</td>
                                <td>{data.gstAmount}</td>
                            </tr>
                            <tr>
                                <td>Other</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{data.totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="amount-in-words">
                    <b>Amount in Words:</b> PKR ______ Only
                </div>

                <div className="terms-section">
                    <p><b>TERMS & CONDITIONS</b></p>
                    <p>1. Goods once sold will not be returned without prior approval.</p>
                    <p>2. Payment due within agreed terms.</p>
                </div>

                <div className="signature-section">
                    <p>Customer Signature & Stamp</p>
                    <p>Authorized Signature</p>
                </div>

                <div className="footer-section">
                    <div className="footer-message">
                        <p>Thank you for your business!</p>
                    </div>

                    <div className="footer-contact">
                        <div className="footer-contact-item">
                            <div className="footer-contact-label">Company</div>
                            <div className="footer-contact-value">Fine Fusion Textile</div>
                        </div>
                        <div className="footer-contact-item">
                            <div className="footer-contact-label">Email</div>
                            <div className="footer-contact-value">
                                <a href="mailto:finefusiontextile@gmail.com">finefusiontextile@gmail.com</a>
                            </div>
                        </div>
                        <div className="footer-contact-item">
                            <div className="footer-contact-label">Phone</div>
                            <div className="footer-contact-value">
                                <a href="tel:03151113223">0315-1113223</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="button-section">
                    <button className="btn-primary" onClick={() => window.print()}>
                        Print Invoice
                    </button>

                    <button className="btn-success" onClick={downloadPDF}>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Invoice;
