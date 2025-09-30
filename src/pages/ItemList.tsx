import { useState } from "react";
import imagelogo from "../assets/img/aclcLogo.webp"
import "../../public/css/itemlist.css"
import type { TItemList } from "../types/types"
import { CiEdit } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";
import { FaArchive } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import AddItem from "../components/AddItem";

export default function ItemList() {

  const [searchItem, setSearchItem] = useState<string>("");
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);

  const itemlist: TItemList[] = [
    { id: 1, datetime: "2025-01-01 10:00 AM", name: 'donald', serial_number: 'slab4', category: 'projector', stock: '12', condition: 'N/A' },
    { id: 2, datetime: "2025-01-01 11:00 AM", name: 'noel', serial_number: 'slab2', category: 'hdmi', stock: '21', condition: 'N/A' },
    { id: 3, datetime: "2025-01-01 12:00 AM", name: 'jovelyn', serial_number: '205', category: 'extension wire', stock: '23', condition: 'N/A' },
    { id: 4, datetime: "2025-01-01 12:00 AM", name: 'panfilo', serial_number: '205', category: 'RG45', stock: '4', condition: 'N/A' },
    { id: 5, datetime: "2025-01-01 12:00 AM", name: 'amoin', serial_number: '205', category: 'computer', stock: '2', condition: 'N/A' },
    { id: 6, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '4', condition: 'N/A' },
    { id: 7, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 8, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 9, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 10, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 11, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 12, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 13, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 14, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 15, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 16, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 17, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 18, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 19, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
    { id: 20, datetime: "2025-01-01 12:00 AM", name: 'dada', serial_number: '205', category: 'mouse', stock: '34', condition: 'N/A' },
  ];

  const filteredItems = itemlist.filter(item => item.category.toLowerCase().includes(searchItem.toLowerCase()));

  return (
    <>
      <div className="item-list-container">
        <div className="header-container">
          <h1>Item List</h1>
          <p>
            Create and manage new items in the system. You can input important details such as item name, category. This feature ensures accurate tracking and easy retrieval of items, keeping the inventory up to date and organized.
          </p>
        </div>
        <div className="add-item-container">
          <button type="button" onClick={() => setIsAddItemOpen((prev) => !prev)}><FaPlus /> New Item</button>
        </div>
        <div className="search-contanier">
          <FaSearch className="search-icon" />
          <input type="search" name="searchItem" onChange={(e) => setSearchItem(e.target.value)} placeholder="Search by Category..." />
        </div>
        <main className="item-list-table-container">
          <table className="item-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Item Name</th>
                <th>Serial Num</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Condition</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><img src={imagelogo} alt={item.name} /></td>
                  <td>{item.name}</td>
                  <td>{item.serial_number}</td>
                  <td>{item.category}</td>
                  <td>{item.stock}</td>
                  <td>{item.condition}</td>
                  <td>{item.datetime}</td>
                  <td className="action-buttons-container">
                    <button type="button" className="edit-button"><CiEdit /></button>
                    <button type="button" className="archive-button"><FaArchive /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
      {isAddItemOpen && (<AddItem />)}
    </>
  )
}
