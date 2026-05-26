import { Alert, Button, MenuItem, TextField } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import * as yup from "yup";
import "../login-form/LoginForm.css";
import { useApi } from "../ApiProvider";

function AddUserForm() {
    const apiClient = useApi();
    const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

    const onSubmit = useCallback(
        (
            values: { username: string; email: string; name: string; password: string; role: string },
            formik: any
        ) => {
            setMessage(null);
            apiClient.addUser(values).then((response) => {
                if (response.success) {
                    setMessage({ kind: "success", text: "User added successfully!" });
                    formik.resetForm();
                } else if (response.statusCode === 403) {
                    setMessage({ kind: "error", text: "Only a librarian can add users." });
                } else {
                    setMessage({
                        kind: "error",
                        text: "Failed to add user. The username may already exist or some field is invalid.",
                    });
                }
            });
        },
        [apiClient]
    );

    const validationSchema = useMemo(
        () =>
            yup.object().shape({
                username: yup
                    .string()
                    .min(3, "Username must be at least 3 characters")
                    .required("Username is required!"),
                email: yup.string().email("Must be a valid email!").required("Email is required!"),
                name: yup.string().required("Full name is required!"),
                password: yup.string().required("Password is required!").min(5, "Password is too short!"),
                role: yup.string().required("Role is required!"),
            }),
        []
    );

    return (
        <div>
            <h2>Add new user</h2>
            {message && (
                <Alert severity={message.kind} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}
            <Formik
                initialValues={{ username: "", email: "", name: "", password: "", role: "READER" }}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
            >
                {(formik: any) => (
                    <form className="login-form" onSubmit={formik.handleSubmit}>
                        <TextField
                            name="username"
                            label="Username:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.username}
                            error={formik.touched.username && !!formik.errors.username}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            name="email"
                            label="Email:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            error={formik.touched.email && !!formik.errors.email}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            name="name"
                            label="Full name:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                            error={formik.touched.name && !!formik.errors.name}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                        <TextField
                            name="password"
                            label="Password:"
                            variant="standard"
                            type="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            error={formik.touched.password && !!formik.errors.password}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <TextField
                            select
                            name="role"
                            label="User role:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.role}
                            sx={{ width: "100%", textAlign: "left" }}
                        >
                            <MenuItem value="READER">Reader</MenuItem>
                            <MenuItem value="LIBRARIAN">Librarian</MenuItem>
                        </TextField>

                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            type="submit"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                        >
                            Add user
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default AddUserForm;
