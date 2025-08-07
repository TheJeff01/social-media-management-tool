import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [signState, setSignState] = useState("Sign In");

  const toggleSignState = () => {
    setSignState((prevState) =>
      prevState === "Sign In" ? "Sign Up" : "Sign In"
    );
  };

  return (
    <div className="login">
      <div className="login-form">
        <h1>{signState}</h1>
        <form>
          {signState === "Sign Up" ? (
            <input type="text" placeholder="Your name" />
          ) : (
            <></>
          )}
          <input type="email" placeholder="Enter Email" required />
          <input type="password" placeholder="Password" required />

          <div className="form-switch">
            {signState === "Sign In" ? (
              <p>
                New to JeffApp? <span onClick={toggleSignState}>Sign Up</span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={toggleSignState}>Sign in Now</span>
              </p>
            )}
          </div>

          <button className="login-btn" type="submit">
            {signState}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
