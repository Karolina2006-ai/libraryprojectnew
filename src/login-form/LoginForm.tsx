import { Button, TextField, Alert } from "@mui/material";
import "./LoginForm.css";
import LoginIcon from "@mui/icons-material/Login";
import { Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import * as yup from "yup";

import { useAuth } from "../ApiProvider";
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const onSubmit = useCallback(
        async (values: { username: string; password: string }, formik: any) => {
            setErrorMessage(null);
            const success = await login(values);
            if (success) {
                navigate("/books");
            } else {
                setErrorMessage("Invalid username or password");
                formik.setFieldError("username", " ");
                formik.setFieldError("password", " ");
            }
        },
        [login, navigate]
    );

    const validationSchema = useMemo(
        () =>
            yup.object().shape({
                username: yup.string().required("Username is required!"),
                password: yup.string().required("Password is required!").min(5, "Password is too short!"),
            }),
        []
    );

    return (
        <div>
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
                validateOnChange
                validateOnBlur
            >
                {(formik: any) => (
                    <form className="login-form" id="signForm" onSubmit={formik.handleSubmit}>
                        {errorMessage && (
                            <Alert severity="error" sx={{ width: "100%" }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <TextField
                            id="username"
                            name="username"
                            label="Username:"
                            variant="standard"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && !!formik.errors.username}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            id="password"
                            name="password"
                            label="Password:"
                            variant="standard"
                            type="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && !!formik.errors.password}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <Button
                            variant="contained"
                            startIcon={<LoginIcon />}
                            type="submit"
                            disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                        >
                            Login
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default LoginForm;
