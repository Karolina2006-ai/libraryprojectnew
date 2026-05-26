import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Button,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApi, useAuth } from "../ApiProvider";

export interface User {
    userId: number;
    username: string;
    email: string;
    name?: string;
    role: "READER" | "LIBRARIAN";
}

function UserListItem({
    user,
    canDelete,
    onDelete,
}: {
    user: User;
    canDelete: boolean;
    onDelete: (id: number) => void;
}) {
    return (
        <ListItem
            divider
            secondaryAction={
                canDelete ? (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => onDelete(user.userId)}
                    >
                        Delete
                    </Button>
                ) : null
            }
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: user.role === "LIBRARIAN" ? "primary.main" : "success.main" }}>
                    <PersonIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={user.name || user.username}
                secondary={
                    <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                            {user.email}
                        </Typography>
                        {" — @" + user.username}
                    </React.Fragment>
                }
            />
            <Chip
                label={user.role}
                color={user.role === "LIBRARIAN" ? "primary" : "default"}
                variant="outlined"
                sx={{ mr: 8 }}
            />
        </ListItem>
    );
}

function UserList() {
    const apiClient = useApi();
    const { currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    const isLibrarian = currentUser?.role === "LIBRARIAN";

    const fetchUsers = () => {
        apiClient.getUsers().then((response) => {
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setMessage("Failed to load users. Only librarians can see this list.");
            }
        });
    };

    useEffect(() => {
        if (isLibrarian) {
            fetchUsers();
        }

    }, [isLibrarian]);

    const handleDelete = (userId: number) => {
        apiClient.deleteUser(userId).then((response) => {
            if (response.success) {
                fetchUsers();
            } else {
                setMessage("Failed to delete user.");
            }
        });
    };

    if (!isLibrarian) {
        return (
            <Paper elevation={3} sx={{ maxWidth: 600, margin: "0 auto", mt: 4, p: 3 }}>
                <Alert severity="warning">Only a librarian can view the list of users.</Alert>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ maxWidth: 700, margin: "0 auto", mt: 4 }}>
            <h2 style={{ textAlign: "center", paddingTop: "1rem" }}>Library Users</h2>
            {message && (
                <Alert severity="error" onClose={() => setMessage(null)} sx={{ mx: 2 }}>
                    {message}
                </Alert>
            )}
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {users.length === 0 ? (
                    <Typography sx={{ textAlign: "center", p: 3, color: "text.secondary" }}>
                        No users registered.
                    </Typography>
                ) : (
                    users.map((user) => (
                        <UserListItem
                            key={user.userId}
                            user={user}
                            canDelete={user.userId !== currentUser?.userId}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </List>
        </Paper>
    );
}

export default UserList;
