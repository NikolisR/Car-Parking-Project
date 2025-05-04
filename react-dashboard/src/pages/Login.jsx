import { useAuth0 } from '@auth0/auth0-react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // After login, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}
    >
      <Row>
        <Col className="d-flex justify-content-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="shadow-lg text-center p-5 border-0 rounded-4"
              style={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255,255,255,0.85)',
                width: '400px',
                maxWidth: '90%',
              }}
            >
              <Card.Body>
                <h2 className="mb-4" style={{ color: '#224abe', fontSize: '2rem' }}>
                  Welcome to PCT Parking
                </h2>

                {!isLoading && (
                  <>
                    <p className="mb-4" style={{ color: '#333', fontSize: '1.1rem' }}>
                      Please log in to continue.
                    </p>
                    <Button
                      onClick={() => loginWithRedirect()}
                      className="px-5 py-3"
                      style={{ background: '#4e73df', border: 'none', fontSize: '1rem' }}
                    >
                      <FaSignInAlt className="me-2" />
                      Log In
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}
