import React from "react";
import "./App.css";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

import LoginForm from "./login-form/LoginForm";
import AddUserForm from "./user-form/AddUserForm";
import AddBookForm from "./book-form/AddBookForm";
import BookList from "./book-list/BookList";
import UserList from "./user-list/UserList";
import LoanList from "./loan-list/LoanList";
import ApiProvider, { useAuth } from "./ApiProvider";

const linkStyles = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "#ffd54f" : "#fff",
    textDecoration: "none",
    fontWeight: isActive ? "bold" : 500,
    padding: "8px 16px",
    borderBottom: isActive ? "2px solid #ffd54f" : "2px solid transparent",
});

function NavBar() {
    const { isLoggedIn, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isLibrarian = currentUser?.role === "LIBRARIAN";

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar sx={{ gap: 1 }}>
                <Typography variant="h6" sx={{ flexShrink: 0, mr: 3 }}>
                    Library System
                </Typography>

                {!isLoggedIn && (
                    <NavLink to="/" style={linkStyles}>
                        Login
                    </NavLink>
                )}

                {isLoggedIn && (
                    <>
                        <NavLink to="/books" style={linkStyles}>
                            Book catalog
                        </NavLink>
                        <NavLink to="/loans" style={linkStyles}>
                            {isLibrarian ? "All loans" : "My loans"}
                        </NavLink>
                        {isLibrarian && (
                            <>
                                <NavLink to="/users" style={linkStyles}>
                                    Users
                                </NavLink>
                                <NavLink to="/add-book" style={linkStyles}>
                                    Add book
                                </NavLink>
                                <NavLink to="/add-user" style={linkStyles}>
                                    Add user
                                </NavLink>
                            </>
                        )}
                    </>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {isLoggedIn && currentUser && (
                    <>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {currentUser.name || currentUser.username} ({currentUser.role})
                        </Typography>
                        <Button
                            color="inherit"
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

function RequireLibrarian({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }
    if (currentUser.role !== "LIBRARIAN") {
        return <Navigate to="/books" replace />;
    }
    return <>{children}</>;
}

function AppShell() {
    return (
        <div className="App">
            <NavBar />
            <div style={{ padding: "0 2rem 2rem 2rem" }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <section>
                                <h1 style={{ textAlign: "center" }}>Welcome to the Library</h1>
                                <LoginForm />
                            </section>
                        }
                    />

                    <Route
                        path="/books"
                        element={
                            <RequireAuth>
                                <BookList />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/loans"
                        element={
                            <RequireAuth>
                                <LoanList />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/users"
                        element={
                            <RequireLibrarian>
                                <UserList />
                            </RequireLibrarian>
                        }
                    />

                    <Route
                        path="/add-book"
                        element={
                            <RequireLibrarian>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <AddBookForm />
                                </div>
                            </RequireLibrarian>
                        }
                    />

                    <Route
                        path="/add-user"
                        element={
                            <RequireLibrarian>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <AddUserForm />
                                </div>
                            </RequireLibrarian>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ApiProvider>
                <AppShell />
            </ApiProvider>
        </BrowserRouter>
    );
}

export default App;
