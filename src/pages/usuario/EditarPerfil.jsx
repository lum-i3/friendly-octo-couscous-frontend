import { Card, Row, Col } from "react-bootstrap";
import SidebarLayout from "../../components/SidebarLayout";

function EditarPerfil() {
  return (
    <SidebarLayout>
      <Card className="m-4">
        <Card.Body>
          <Row>
            <Col>
              <h3>Editar Perfil</h3>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </SidebarLayout>
  );
}

export default EditarPerfil;