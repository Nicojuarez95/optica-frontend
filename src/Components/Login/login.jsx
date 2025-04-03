import React, { useState } from "react";

export default function Login ({ onLogin }) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
  
    const handleLogin = () => {
        console.log("Usuario env:", process.env.REACT_APP_USER);
        console.log("Contraseña env:", process.env.REACT_APP_PASS);
        console.log("Variables de entorno:", process.env);
      
        const envUser = process.env.REACT_APP_USER;
        const envPass = process.env.REACT_APP_PASS;
      
        if (user === envUser && pass === envPass) {
          onLogin(true);
        } else {
          setError("Usuario o contraseña incorrectos");
        }
      };
  
    return (
        <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "300px",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Iniciá Sesión Gino</h2>
      
          <input
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          />
      
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          />
      
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Ingresar
          </button>
      
          {error && (
            <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };