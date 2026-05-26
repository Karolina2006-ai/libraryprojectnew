import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApi, useAuth } from "../ApiProvider";

export interface Book {
    bookId: number;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    yearPublished: number;
    availableCopies: number;
}

function BookListItem({
    book,
    isLibrarian,
    isReader,
    onBorrow,
    onDelete,
}: {
    book: Book;
    isLibrarian: boolean;
    isReader: boolean;
    onBorrow: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <ListItem
            divider
            secondaryAction={
                <>
                    {isReader && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onBorrow(book.bookId)}
                            disabled={book.availableCopies <= 0}
                            sx={{ mr: 1 }}
                        >
                            Borrow
                        </Button>
                    )}
                    {isLibrarian && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => onDelete(book.bookId)}
                        >
                            Delete
                        </Button>
                    )}
                </>
            }
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                    <BookIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={book.title}
                secondary={
                    <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                            {book.author} ({book.yearPublished})
                        </Typography>
                        {" — Available copies: " + book.availableCopies}
                    </React.Fragment>
                }
            />
        </ListItem>
    );
}

function BookList() {
    const apiClient = useApi();
    const { currentUser } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

    const isLibrarian = currentUser?.role === "LIBRARIAN";
    const isReader = currentUser?.role === "READER";

    const fetchBooks = () => {
        apiClient.getBooks().then((response) => {
            if (response.success && response.data) {
                setBooks(response.data);
            } else {
                setMessage({ kind: "error", text: "Failed to fetch books from the server." });
            }
        });
    };

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBorrow = (bookId: number) => {
        if (!currentUser) {
            setMessage({ kind: "error", text: "You must be logged in to borrow a book." });
            return;
        }
        apiClient.borrowBook(bookId, currentUser.userId).then((response) => {
            if (response.success) {
                setMessage({ kind: "success", text: "Book borrowed successfully!" });
                fetchBooks();
            } else {
                setMessage({ kind: "error", text: "Failed to borrow book. It might be out of stock." });
            }
        });
    };

    const handleDelete = (bookId: number) => {
        apiClient.deleteBook(bookId).then((response) => {
            if (response.success) {
                setMessage({ kind: "success", text: "Book deleted." });
                fetchBooks();
            } else {
                setMessage({ kind: "error", text: "Failed to delete book." });
            }
        });
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 700, margin: "0 auto", mt: 4 }}>
            <h2 style={{ textAlign: "center", paddingTop: "1rem" }}>Library Catalog</h2>
            {message && (
                <Alert severity={message.kind} onClose={() => setMessage(null)} sx={{ mx: 2 }}>
                    {message.text}
                </Alert>
            )}
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {books.length === 0 ? (
                    <Typography sx={{ textAlign: "center", p: 3, color: "text.secondary" }}>
                        No books in the catalog yet.
                    </Typography>
                ) : (
                    books.map((book) => (
                        <BookListItem
                            key={book.bookId}
                            book={book}
                            isLibrarian={isLibrarian}
                            isReader={isReader}
                            onBorrow={handleBorrow}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </List>
        </Paper>
    );
}

export default BookList;
