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
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useApi, useAuth } from "../ApiProvider";

export interface Loan {
    loanId: number;
    loanDate: string;
    dueDate: string;
    returnDate: string | null;
    book: {
        bookId: number;
        title: string;
        author: string;
    };
    user: {
        userId: number;
        username: string;
    };
}

function LoanListItem({
    loan,
    canReturn,
    onReturn,
}: {
    loan: Loan;
    canReturn: boolean;
    onReturn: (id: number) => void;
}) {
    const isReturned = loan.returnDate !== null;

    return (
        <ListItem
            divider
            secondaryAction={
                !isReturned && canReturn ? (
                    <Button variant="contained" color="secondary" onClick={() => onReturn(loan.loanId)}>
                        Return book
                    </Button>
                ) : null
            }
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: isReturned ? "success.main" : "warning.main" }}>
                    <AssignmentIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={`Book: ${loan.book?.title || "Unknown"}`}
                secondary={
                    <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                            Borrowed by: {loan.user?.username || "Unknown"}
                        </Typography>
                        <br />
                        {`Loan date: ${loan.loanDate || "N/A"} — Due: ${loan.dueDate || "N/A"}`}
                    </React.Fragment>
                }
            />
            <Chip
                label={isReturned ? `Returned: ${loan.returnDate}` : "Active"}
                color={isReturned ? "success" : "warning"}
                variant="outlined"
            />
        </ListItem>
    );
}

function LoanList() {
    const apiClient = useApi();
    const { currentUser } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    const isLibrarian = currentUser?.role === "LIBRARIAN";

    const fetchLoans = () => {
        const request = isLibrarian ? apiClient.getAllLoans() : apiClient.getMyLoans();
        request.then((response) => {
            if (response.success && response.data) {
                setLoans(response.data);
            } else {
                setMessage("Failed to load loans.");
            }
        });
    };

    useEffect(() => {
        if (currentUser) {
            fetchLoans();
        }

    }, [currentUser]);

    const handleReturn = (loanId: number) => {
        apiClient.returnBook(loanId).then((response) => {
            if (response.success) {
                fetchLoans();
            } else {
                setMessage("Failed to return book.");
            }
        });
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 800, margin: "0 auto", mt: 4 }}>
            <h2 style={{ textAlign: "center", paddingTop: "1rem" }}>
                {isLibrarian ? "All Loans" : "My Loan History"}
            </h2>
            {message && (
                <Alert severity="error" onClose={() => setMessage(null)} sx={{ mx: 2 }}>
                    {message}
                </Alert>
            )}
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {loans.length === 0 ? (
                    <Typography sx={{ textAlign: "center", p: 3, color: "text.secondary" }}>
                        No loans found.
                    </Typography>
                ) : (
                    loans.map((loan) => (
                        <LoanListItem
                            key={loan.loanId}
                            loan={loan}
                            canReturn={isLibrarian || loan.user?.userId === currentUser?.userId}
                            onReturn={handleReturn}
                        />
                    ))
                )}
            </List>
        </Paper>
    );
}

export default LoanList;
