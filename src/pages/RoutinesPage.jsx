import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const frequencyOptions = ["Daily", "Weekly", "Monthly"];

export default function RoutinesPage() {
  const { user } = useAuth();
  const [myRoutines, setMyRoutines] = useState([]);
  const [publicRoutines, setPublicRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineFrequency, setNewRoutineFrequency] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  // Fetch public routines from Firestore
  useEffect(() => {
    const fetchPublicRoutines = async () => {
      const routinesSnap = await getDocs(collection(db, "public_routines"));
      const routines = routinesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPublicRoutines(routines);
    };

    const fetchUserRoutines = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setMyRoutines(data.myRoutines || []);
      }
    };

    fetchPublicRoutines();
    fetchUserRoutines();
  }, [user]);

  const addRoutine = async (routine) => {
    setLoading(true);
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedRoutines = data.myRoutines || [];

      if (!updatedRoutines.find((r) => r.name === routine.name)) {
        updatedRoutines.push({
          ...routine,
          createdAt: new Date().toISOString(),
          streak: 0,
          paused: false,
        });

        await updateDoc(userRef, { myRoutines: updatedRoutines });
        setMyRoutines(updatedRoutines);
      }
    }
    setMessage(`"${routine.name}" added to your routines.`);
    setTimeout(() => setMessage(""), 3000);

    setLoading(false);
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    const routine = {
      name: newRoutineTitle,
      frequency: newRoutineFrequency,
      public: isPublic,
      createdAt: new Date().toISOString(),
      streak: 0,
      paused: false,
    };

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const updatedRoutines = data.myRoutines || [];
      updatedRoutines.push(routine);
      await updateDoc(userRef, { myRoutines: updatedRoutines });
      setMyRoutines(updatedRoutines);
    }

    // Si es pública, también agregar a public_routines
    if (isPublic) {
      await addDoc(collection(db, "public_routines"), {
        name: newRoutineTitle,
        frequency: newRoutineFrequency,
        createdAt: new Date().toISOString(),
      });

      // Refetch de public_routines
      const routinesSnap = await getDocs(collection(db, "public_routines"));
      const routines = routinesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPublicRoutines(routines);
    }

    setMessage("Routine created successfully!");

    setTimeout(() => {
      setMessage("");
    }, 3000);

    setNewRoutineTitle("");
    setNewRoutineFrequency("");
    setIsPublic(false);
    setShowModal(false);
  };

  // Filtrado
  const filteredRoutines = publicRoutines.filter((routine) => {
    if (filter === "all") return true;
    const isAdded = myRoutines.some((r) => r.name === routine.name);
    if (filter === "added") return isAdded;
    if (filter === "not-added") return !isAdded;
    return true;
  });

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Routines</h2>
        <button className="btn btn-menta" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i> Create Routine
        </button>
      </div>

      {message && (
        <div className="alert alert-success text-center py-2" role="alert">
          {message}
        </div>
      )}

      <div className="d-flex gap-2 mb-4">
        <button
          className={`btn-reset ${
            filter === "all" ? "btn-menta" : "btn-outline-light"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn-reset ${
            filter === "added" ? "btn-menta" : "btn-outline-light"
          }`}
          onClick={() => setFilter("added")}
        >
          Added
        </button>
        <button
          className={`btn-reset ${
            filter === "not-added" ? "btn-menta" : "btn-outline-light"
          }`}
          onClick={() => setFilter("not-added")}
        >
          Not Added
        </button>
      </div>

      <div className="row g-3 mb-4">
        {filteredRoutines.map((routine, index) => {
          const isAdded = myRoutines.some((r) => r.name === routine.name);

          return (
            <div className="col-6 col-lg-3" key={index}>
              <div className="card bg-dark text-white h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title mb-2">{routine.name}</h5>
                  <p
                    className="text-secondary mb-3"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {routine.frequency}
                  </p>
                  <button
                    className={`btn mt-auto ${
                      isAdded ? "btn-outline-menta" : "btn-menta"
                    }`}
                    onClick={() => !isAdded && addRoutine(routine)}
                    // disabled={loading || isAdded}
                  >
                    {isAdded ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="custom-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-white p-3 rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Create New Routine</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateRoutine}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Routine Title"
                    value={newRoutineTitle}
                    onChange={(e) => setNewRoutineTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <select
                    className="form-select bg-dark text-white"
                    value={newRoutineFrequency}
                    onChange={(e) => setNewRoutineFrequency(e.target.value)}
                    required
                  >
                    <option value="">Select Frequency</option>
                    {frequencyOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                    id="publicCheck"
                  />
                  <label className="form-check-label" htmlFor="publicCheck">
                    Public (share with others)
                  </label>
                </div>

                <button type="submit" className="btn btn-menta w-100">
                  Save Routine
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
