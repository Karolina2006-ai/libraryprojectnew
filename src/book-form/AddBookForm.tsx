import { Alert, Button, TextField } from "@mui/material";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import * as yup from "yup";
import "../login-form/LoginForm.css";
import { useApi } from "../ApiProvider";

function AddBookForm() {
    const apiClient = useApi();
    const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

    const onSubmit = useCallback(
        (values: any, formik: any) => {
            setMessage(null);
            apiClient.addBook(values).then((response) => {
                if (response.success) {
                    setMessage({ kind: "success", text: "Book added successfully!" });
                    formik.resetForm();
                } else if (response.statusCode === 403) {
                    setMessage({ kind: "error", text: "Only a librarian can add books." });
                } else {
                    setMessage({
                        kind: "error",
                        text: "Failed to add book. Make sure all fields are valid.",
                    });
                }
            });
        },
        [apiClient]
    );

    const currentYear = new Date().getFullYear();

    const validationSchema = useMemo(
        () =>
            yup.object().shape({
                isbn: yup.string().required("ISBN is required!"),
                title: yup.string().required("Title is required!"),
                author: yup.string().required("Author is required!"),
                publisher: yup.string().required("Publisher is required!"),
                yearPublished: yup
                    .number()
                    .typeError("Must be a number")
                    .min(1000, "Year must be after 1000")
                    .max(currentYear, `Year cannot be after ${currentYear}`)
                    .required("Year is required!"),
                availableCopies: yup
                    .number()
                    .typeError("Must be a number")
                    .min(1, "Must have at least 1 copy")
                    .required("Required!"),
            }),
        [currentYear]
    );

    return (
        <div>
            <h2>Add new book</h2>
            {message && (
                <Alert severity={message.kind} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}
            <Formik
                initialValues={{
                    isbn: "",
                    title: "",
                    author: "",
                    publisher: "",
                    yearPublished: "",
                    availableCopies: "",
                }}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
            >
                {(formik: any) => (
                    <form className="login-form" onSubmit={formik.handleSubmit}>
                        <TextField
                            name="isbn"
                            label="ISBN:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.isbn}
                            error={formik.touched.isbn && !!formik.errors.isbn}
                            helperText={formik.touched.isbn && formik.errors.isbn}
                        />
                        <TextField
                            name="title"
                            label="Title:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.title}
                            error={formik.touched.title && !!formik.errors.title}
                            helperText={formik.touched.title && formik.errors.title}
                        />
                        <TextField
                            name="author"
                            label="Author:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.author}
                            error={formik.touched.author && !!formik.errors.author}
                            helperText={formik.touched.author && formik.errors.author}
                        />
                        <TextField
                            name="publisher"
                            label="Publisher:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.publisher}
                            error={formik.touched.publisher && !!formik.errors.publisher}
                            helperText={formik.touched.publisher && formik.errors.publisher}
                        />
                        <TextField
                            name="yearPublished"
                            label="Year published:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.yearPublished}
                            error={formik.touched.yearPublished && !!formik.errors.yearPublished}
                            helperText={formik.touched.yearPublished && formik.errors.yearPublished}
                        />
                        <TextField
                            name="availableCopies"
                            label="Available copies:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.availableCopies}
                            error={formik.touched.availableCopies && !!formik.errors.availableCopies}
                            helperText={formik.touched.availableCopies && formik.errors.availableCopies}
                        />

                        <Button
                            variant="contained"
                            startIcon={<LibraryAddIcon />}
                            type="submit"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                        >
                            Add book
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default AddBookForm;
