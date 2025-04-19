import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState("");
  const [category, setCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const nameRef = useRef();

  const fetchItems = async () => {
    const q = query(
      collection(db, "shopping_items"),
      where("userId", "==", user.uid)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemText) return;

    if (selectedItem) {
      await updateDoc(doc(db, "shopping_items", selectedItem.id), {
        name: itemText,
        category: category || null,
      });
    } else {
      await addDoc(collection(db, "shopping_items"), {
        userId: user.uid,
        name: itemText,
        category: category || null,
        createdAt: serverTimestamp(),
      });
    }

    resetForm();
    fetchItems();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "shopping_items", id));
    resetForm();
    fetchItems();
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setItemText(item.name);
    setCategory(item.category || "");
    setShowModal(true);
  };

  const resetForm = () => {
    setItemText("");
    setCategory("");
    setSelectedItem(null);
    setShowModal(false);
  };

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Shopping List</h2>
        <button
          className="btn btn-menta"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i> Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-secondary">No items added yet.</p>
      ) : (
        <ul className="list-group">
          {items.map((item) => (
            <li
              key={item.id}
              className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center"
            >
              <div>
                {item.name}
                {item.category && (
                  <span className="badge bg-secondary ms-2">
                    {item.category}
                  </span>
                )}
              </div>
              <button
                className="btn btn-sm text-white"
                onClick={() => handleEdit(item)}
                title="Edit"
              >
                <i className="bi bi-gear"></i>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="custom-modal-backdrop" onClick={resetForm}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-white p-3 rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">
                  {selectedItem ? "Edit Item" : "Add Item"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={resetForm}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <input
                    ref={nameRef}
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Item name"
                    value={itemText}
                    onChange={(e) => setItemText(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Select Category</label>
                  <select
                    className="form-select bg-dark text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">-- Select Category --</option>
                    {Array.from(
                      new Set(items.map((i) => i.category).filter(Boolean))
                    ).map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <details className="mt-2">
                    <summary className="opacity-50 mb-2">
                      Add new category
                    </summary>
                    <input
                      type="text"
                      className="form-control mt-2 bg-dark text-white"
                      placeholder="New category"
                      value={
                        category &&
                        !items.map((i) => i.category).includes(category)
                          ? category
                          : ""
                      }
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </details>
                </div>

                <button className="btn btn-menta w-100" type="submit">
                  {selectedItem ? "Save Changes" : "Add Item"}
                </button>

                {selectedItem && (
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 mt-2"
                    onClick={() => handleDelete(selectedItem.id)}
                  >
                    Delete
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
