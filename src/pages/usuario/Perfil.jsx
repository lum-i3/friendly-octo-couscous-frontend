import { useState } from "react";
import "../../style/perfil.css"; // Estilos del sidebar
import SidebarLayout from "../../components/SidebarLayout";

function Perfil() {
  // Estados para manejar el formulario de forma interactiva
  const [email] = useState("correo@ejemplo.com");
  const [username] = useState("Lucia López");
  const [alertType] = useState("needed"); // 'all' | 'needed' | 'none'

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Datos guardados:", { email, username, alertType });
  };

  return (
    <SidebarLayout>
<div className="profile-container">
      {/* Sección del avatar central */}
      <div className="center-avatar-section">
        <div className="center-avatar">
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
            alt="Usuario Central"
            className="center-avatar__img"
          />
        </div>
        <h2 className="center-profile-name">Nombre</h2>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="profile-form">
        {/* Información del perfil (Solo Lectura) */}
        <div className="profile-info-display">
          
          <div className="form-group">
            <span className="info-label">Correo electronico *</span>
            <div className="info-value-box">
              {email}
            </div>
          </div>

          <div className="form-group">
            <span className="info-label">Nombre de usuario *</span>
            <div className="info-value-box">
              {username}
            </div>
          </div>
        </div>

        {/* Ajuste de alertas */}
        <div className="alerts-section">
          <h3 className="alerts-title">Ajuste de alertas del sistema</h3>

          <div className="switch-group" onClick={() => setAlertType("all")}>
            <button
              type="button"
              className={`switch-btn ${alertType === "all" ? "switch-btn--active" : ""}`}
              aria-label="Recibir todas las alertas"
            >
              <span className="switch-thumb"></span>
            </button>
            <span className="switch-label">Recibir todas las alertas</span>
          </div>

          <div className="switch-group" onClick={() => setAlertType("needed")}>
            <button
              type="button"
              className={`switch-btn ${alertType === "needed" ? "switch-btn--active" : ""}`}
              aria-label="Recibir solo las necesarias"
            >
              <span className="switch-thumb"></span>
            </button>
            <span className="switch-label">Recibir solo las necesarias</span>
          </div>

          <div className="switch-group" onClick={() => setAlertType("none")}>
            <button
              type="button"
              className={`switch-btn ${alertType === "none" ? "switch-btn--active" : ""}`}
              aria-label="No recibir ninguna alerta"
            >
              <span className="switch-thumb"></span>
            </button>
            <span className="switch-label">No recibir ninguna alerta</span>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Editar perfil
          </button>
          <button type="button" className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </form>
    </div>
    </SidebarLayout>
  );
}

export default Perfil;