import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [itemText, setItemText] = useState("");
  const [category, setCategory] = useState("");

  const fetchItems = async () => {
    const q = query(
      collection(db, "shopping_items"),
      where("userId", "==", user.uid)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // ordenamos por fecha de creación descendente
    data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    setItems(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!itemText) return;

    await addDoc(collection(db, "shopping_items"), {
      userId: user.uid,
      name: itemText,
      category: category || null,
      createdAt: serverTimestamp(),
    });

    setItemText("");
    setCategory("");
    fetchItems();
  };

  const handleDelete = async (itemId) => {
    await deleteDoc(doc(db, "shopping_items", itemId));
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-4">Shopping List</h2>

      <form onSubmit={handleAdd} className="row g-2 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control bg-dark text-white"
            placeholder="Item name"
            value={itemText}
            onChange={(e) => setItemText(e.target.value)}
            required
          />
        </div>

        <div className="col-md-4">
          <input
            type="text"
            className="form-control bg-dark text-white"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-menta w-100" type="submit">
            Add
          </button>
        </div>
      </form>

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
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(item.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
