import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const firebaseUid = user?.firebaseUser?.uid;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* =========================
     REALTIME UNREAD LISTENER
  ========================= */
  useEffect(() => {
    if (!firebaseUid) {
      setUnreadCount(0);
      return;
    }

    const convsRef = ref(database, "conversations");

    const unsubscribe = onValue(convsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUnreadCount(0);
        return;
      }

      let totalUnread = 0;

      snapshot.forEach((convSnap) => {
        const conv = convSnap.val();
        if (conv?.unread?.[firebaseUid]) {
          totalUnread += 1;
        }
      });

      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [firebaseUid]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          HireMe
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {/* 🔹 JOB BOARD */}
            <Nav.Link as={Link} to="/jobs">
              Jobs
            </Nav.Link>

            {firebaseUid ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>

                {/* 🔹 MESSAGES WITH BADGE */}
                <Nav.Link
                  as={Link}
                  to="/chat"
                  style={{ position: "relative" }}
                >
                  Messages
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="ms-1"
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-10px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>

                <Button
                  variant="outline-light"
                  onClick={handleLogout}
                  className="ms-lg-3 mt-2 mt-lg-0"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}