import { useState } from "react";
import { auth, provider } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-white">
      <div className="p-4" style={{ width: "100%", maxWidth: 400 }}>
        <h3 className="text-center mb-3">
          <img src={"logo.png"} width="200px" className="mx-auto" />
          <hr />
        </h3>

        <button
          type="button"
          className="btn btn-google w-100 my-4 "
          onClick={handleGoogle}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          Continue with Google
        </button>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <hr />
        <h3 className="text-center mb-3">
          {isLogin ? "Login" : "Create Account"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control bg-dark text-white border-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-menta w-100 mb-5">
            {isLogin ? "Login" : "Sign up"}
          </button>

          <div className="text-center">
            <small>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <br />
              <button
                type="button"
                className="btn btn-link p-0 text-info"
                onClick={toggleMode}
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
