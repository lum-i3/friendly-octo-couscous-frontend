import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import "./../Style/login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita recargar la página al presionar el botón
  };

  return (
    <Container fluid className="login-screen p-0">
      <Row className="g-0 h-100 min-vh-100">
        
        {/* COLUMNA IZQUIERDA: Formulario Centrado */}
        <Col lg={6} md={12} className="form-column d-flex align-items-center justify-content-center h-100">
          <div className="login-card-container w-100">
            
            <h1 className="login-title text-center">Iniciar sesión</h1>
            <p className="login-subtitle text-center">Ingresa tus credenciales para acceder</p>

            <Form onSubmit={handleSubmit} className="mt-4">
              
              {/* Campo: Correo Electrónico */}
              <Form.Group className="mb-3" controlId="correo">
                <Form.Label className="input-label">Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="tu.email@empresa.com"
                  className="custom-input-field"
                />
              </Form.Group>

              {/* Campo: Contraseña */}
              <Form.Group className="mb-3" controlId="password">
                <Form.Label className="input-label">Contraseña</Form.Label>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    className="custom-input-field"
                  />
                  {/* Icono de ojo para simular el toggle visual */}
                  <span 
                    className="password-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </span>
                </div>
              </Form.Group>

              {/* Fila: Recordarme y Olvidaste tu contraseña */}
              <Row className="mb-4 align-items-center extra-options-row g-0">
                <Col xs={6}>
                  <Form.Check 
                    type="checkbox"
                    id="rememberMe"
                    label="Recordarme"
                    className="checkbox-custom"
                  />
                </Col>
                <Col xs={6} className="text-end">
                  <a href="#forgot" className="forgot-password-link">
                    ¿Olvidaste tu contraseña?
                  </a>
                </Col>
              </Row>

              {/* Botón de Ingresar */}
              <Button
                variant="primary"
                className="btn-login-submit w-100 mb-4"
                type="submit"
              >
                Iniciar sesión
              </Button>

              {/* Enlace para Registro */}
              <div className="text-center register-redirect">
                <span className="text-muted">¿No tienes una cuenta? </span>
                <a href="#register" className="register-link">
                  Crear una cuenta
                </a>
              </div>

            </Form>
          </div>
        </Col>

        {/* COLUMNA DERECHA: Imagen de Fondo con Curva */}
        <Col lg={6} className="image-column d-none d-lg-block h-100">
          <div className="split-image-curve">
            <img 
              src="https://images.unsplash.com/photo-1614021926166-f5e89b0bf933?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Weather and hybrid energy landscape" 
              className="split-bg-img"
            />
          </div>
        </Col>

      </Row>
    </Container>
  );
}

export default Login;