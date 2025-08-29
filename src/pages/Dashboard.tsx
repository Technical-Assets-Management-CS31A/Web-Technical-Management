import { useState } from "react";
import "../../public/css/dashboard.css";
import { Pie } from "react-chartjs-2";
import type { TBorrowedItems } from "../types/types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState<string>("")

    // Pie Chart Component
    const PieChart = () => {
        const data = {
            labels: ["HDMI", "Projector", "Extension Wire", "Others"],
            datasets: [
                {
                    label: "Equipment Count",
                    data: [12, 19, 30, 10],
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 206, 86, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                    ],
                    borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: "right" as const,
                    labels: {
                        color: "rgba(0, 0, 0, 1)",
                        font: {
                            size: 14,
                        },
                        padding: 20
                    },
                },
                tooltip: {
                    enabled: true,
                },
            },
        };

        return <Pie data={data} options={options} />;
    };

    // Staff Status Component
    const staffStatus = [
        { id: 1, name: "morales", status: "active" },
        { id: 2, name: "cortes", status: "inactive" },
        { id: 3, name: "sedillio", status: "active" },
        { id: 4, name: "alicaba", status: "inactive" },
        { id: 5, name: "alicaba", status: "inactive" },
    ];

    // Borrewed Items Component
    const borrowedItems: TBorrowedItems[] = [
        { id: 1, datetime: "2025-01-01 10:00 AM", teacher: 'donald', room: 'slab4', item: 'projector', occupied: 'Alicaba', remarks: 'N/A' },
        { id: 2, datetime: "2025-01-01 11:00 AM", teacher: 'noel', room: 'slab2', item: 'hdmi', occupied: 'Villa', remarks: 'N/A' },
        { id: 3, datetime: "2025-01-01 12:00 AM", teacher: 'jovelyn', room: '205', item: 'extension wire', occupied: 'Casupanan', remarks: 'N/A' },
        { id: 4, datetime: "2025-01-01 12:00 AM", teacher: 'panfilo', room: '205', item: 'RG45', occupied: 'Sedilio', remarks: 'N/A' },
        { id: 5, datetime: "2025-01-01 12:00 AM", teacher: 'amoin', room: '205', item: 'computer', occupied: 'Cortes', remarks: 'N/A' },
        { id: 6, datetime: "2025-01-01 12:00 AM", teacher: 'dada', room: '205', item: 'mouse', occupied: 'Morales', remarks: 'N/A' },
        { id: 7, datetime: "2025-01-01 12:00 AM", teacher: 'dada', room: '205', item: 'mouse', occupied: 'Morales', remarks: 'N/A' },
        { id: 8, datetime: "2025-01-01 12:00 AM", teacher: 'dada', room: '205', item: 'mouse', occupied: 'Morales', remarks: 'N/A' },
    ];

    // Filtered Data
    const filteredData = borrowedItems.filter((item) =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (

        <div className="dashboard-container">
            <div className="badges-container">
                <div className="total-items-container">
                    <h2>Total Items</h2>
                    <p>150</p>
                </div>
                <div className="items-category-container">
                    <h2>Items by Category</h2>
                </div>
                <div className="active-staff-container">
                    <h2>Active Staff</h2>
                    <p>25</p>
                </div>
                <div className="items-borrowed-container">
                    <h2>Items Borrowed</h2>
                    <p>75</p>
                </div>
            </div>
            <div className="main-container">

                {/* Storage Section */}
                <div className="storage-container">
                    <h1>Items Available by Category</h1>
                    <div className="chart-pie-container" style={{ position: "absolute", width: "350px", height: "400px", margin: "-2rem 0 0 10rem" }}>
                        <PieChart />
                    </div>
                </div>

                {/* Staff Status Section */}
                <div className="staff-status-container">
                    <h1>Staff Status</h1>
                    <ul className="staff-list-container">
                        {staffStatus.map((staff) => (
                            <li key={staff.id}>
                                <label htmlFor="">{staff.name.charAt(0).toUpperCase() + staff.name.slice(1)}</label>
                                <span className="active-status">
                                    <div className={`radio-container ${staff.status == 'active' ? 'staff-active' : 'staff-inactive'}`}></div>
                                    <p className="status-text">
                                        {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                                    </p>
                                </span>
                            </li>
                        ))}

                    </ul>
                </div>
            </div>

            {/* Table Borrowed Section */}
            <div className="table-borrowed-items-container">
                <div className="header-table-borrowed-container">
                    <h1>Recently Borrowed Items</h1>
                    <input
                        type="search"
                        name="search"
                        id="search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search items..."
                    />
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Teacher</th>
                                <th>Room</th>
                                <th>Item</th>
                                <th>Occupied By</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.datetime}</td>
                                    <td>{item.teacher.charAt(0).toUpperCase() + item.teacher.slice(1)}</td>
                                    <td>{item.room.charAt(0).toUpperCase() + item.room.slice(1)}</td>
                                    <td>{item.item.charAt(0).toUpperCase() + item.item.slice(1)}</td>
                                    <td>{item.occupied.charAt(0).toUpperCase() + item.occupied.slice(1)}</td>
                                    <td>{item.remarks.charAt(0).toUpperCase() + item.remarks.slice(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
