import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useApp } from "../contexts/AppContext";
import { signInWithGoogle } from "../services/auth";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { setUser, showSnackbar } = useApp();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      showSnackbar(`Welcome ${user.displayName || user.email}!`, "success");
      onLogin();
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        showSnackbar("Sign-in was cancelled", "info");
      } else if (error.code === "auth/popup-blocked") {
        showSnackbar(
          "Popup was blocked. Please allow popups and try again.",
          "warning"
        );
      } else {
        showSnackbar(
          "Error signing in with Google. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: "#f5f5f5",
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 450,
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GE Counter
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Event Space Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage your event spaces and track attendance in
            real-time
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <GoogleIcon />
              )
            }
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #3367d6 0%, #2d8e47 100%)",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Secure authentication powered by Firebase
            </Typography>
          </Divider>

          <Box sx={{ backgroundColor: "#f8f9fa", p: 2, borderRadius: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
            >
              By signing in, you agree to use this application for event
              management purposes. Your Google account information is used only
              for authentication.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
