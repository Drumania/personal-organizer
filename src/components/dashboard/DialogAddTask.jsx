import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { db } from "@/firebase/firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function DialogAddTask({
  visible,
  setVisible,
  userId,
  setTasks,
  editingId,
  title,
  setTitle,
  priority,
  setPriority,
  date,
  setDate,
  category,
  setCategory,
}) {
  const isEditMode = !!editingId;

  const [categoryColor, setCategoryColor] = useState("gray");
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("gray");

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (visible && titleInputRef.current) {
      setTimeout(() => titleInputRef.current.focus(), 100);
    }

    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const list = snap.docs.map((doc) => doc.data());
        setCustomCategories(list);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };

    if (visible) fetchCategories();
  }, [visible]);

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteDoc(doc(db, "todos", editingId));
      setTasks((prev) => prev.filter((t) => t.id !== editingId));
      resetForm();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalCategory = selectedCategory;
    let finalColor = categoryColor;

    if (isAddingNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      finalColor = newCategoryColor;

      try {
        await addDoc(collection(db, "categories"), {
          name: finalCategory,
          color: finalColor,
          userId,
          created_at: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error al guardar categoría:", err);
      }

      setCustomCategories((prev) => [
        ...prev,
        { name: finalCategory, color: finalColor },
      ]);
    }

    const payload = {
      title,
      priority,
      date,
      category: finalCategory,
      color: finalColor,
      userId,
      completed: false,
      created_at: serverTimestamp(),
    };

    try {
      if (isEditMode) {
        const docRef = doc(db, "todos", editingId);
        await updateDoc(docRef, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
        );
      } else {
        const docRef = await addDoc(collection(db, "todos"), payload);
        setTasks((prev) => [...prev, { ...payload, id: docRef.id }]);
      }

      resetForm();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const resetForm = () => {
    setVisible(false);
    setTitle("");
    setPriority("normal");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setSelectedCategory("");
    setCategoryColor("gray");
    setNewCategoryName("");
    setNewCategoryColor("gray");
    setIsAddingNewCategory(false);
  };

  if (!visible) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "#00000088" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditMode ? "Edit Task" : "Add New Task"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={resetForm}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label>Título</label>
                <input
                  ref={titleInputRef}
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Prioridad</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="mb-3">
                <label>Categoría</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__new__") {
                      setIsAddingNewCategory(true);
                      setSelectedCategory("");
                    } else {
                      const found = customCategories.find(
                        (c) => c.name === val
                      );
                      setSelectedCategory(val);
                      setCategoryColor(found?.color || "gray");
                      setIsAddingNewCategory(false);
                    }
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {customCategories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__new__">+ Nueva categoría</option>
                </select>
              </div>

              {isAddingNewCategory && (
                <>
                  <div className="mb-3">
                    <label>Nombre de la nueva categoría</label>
                    <input
                      className="form-control"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Color</label>
                    <select
                      className="form-select"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                    >
                      <option value="purple">Violeta</option>
                      <option value="red">Rojo</option>
                      <option value="blue">Azul</option>
                      <option value="green">Verde</option>
                      <option value="teal">Turquesa</option>
                      <option value="orange">Naranja</option>
                      <option value="pink">Rosa</option>
                      <option value="yellow">Amarillo</option>
                      <option value="crimson">Carmesí</option>
                      <option value="gray">Gris</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer d-flex justify-content-between">
              {isEditMode && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
              )}
              <button type="submit" className="btn btn-menta">
                {isEditMode ? "Guardar cambios" : "Agregar tarea"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
