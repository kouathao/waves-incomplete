import React from "react";

// components
import MyButton from "../utils/button";
import Login from "./Login";

const RegisterLogin = () => {
  return (
    <div className="page_wrapper">
      <div className="container">
        <div className="register_login_container">
          <div className="left">
            <h1>New Customer</h1>
            <p>Lorem ipsum dolor sit amet, consdf adipsing elit, sed do </p>
            <MyButton
              type="default"
              title="Create an account"
              linkTo="/register"
              addStyles={{
                margin: "10 0 0 0"
              }}
            />
          </div>
          <div className="right">
            <h2>Registed customers</h2>
            <p>If you have an account please login</p>
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLogin;
