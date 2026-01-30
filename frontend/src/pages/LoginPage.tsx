import * as React from "react";
import { useAuth } from "react-oidc-context";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "78mm636s6secrjievukbpus3jd";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body1">Loading...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (auth.error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Authentication Error</Typography>
            <Alert severity="error">Encountering error... {auth.error.message}</Alert>
            <Divider />
            <Stack direction="row" spacing={2}>
              <Button
               variant="contained"
               onClick={() => auth.signinRedirect()}
               sx={{ 
                color: "#fff",
                borderColor: "#8F4E45",
                backgroundColor: "#8F4E45"
               }}
              >
                Sign in
              </Button>
              <Button variant="outlined" color="error" onClick={signOutRedirect}>
                Sign out
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (auth.isAuthenticated) {
    const email = auth.user?.profile?.email ?? "(no email)";
    const idToken = auth.user?.id_token ?? "";
    const accessToken = auth.user?.access_token ?? "";
    const refreshToken = auth.user?.refresh_token ?? "";

    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Signed in
            </Typography>

            <Alert severity="success">
              Hello: <b>{email}</b>
            </Alert>

            <Divider />

            <Typography variant="subtitle1" fontWeight={600}>
              Tokens
            </Typography>

            <Stack spacing={1}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>ID Token</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                    }}
                  >
                    {idToken}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Access Token</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                    }}
                  >
                    {accessToken}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Refresh Token</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                    }}
                  >
                    {refreshToken}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => auth.removeUser()}
              >
                Sign out (local)
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={signOutRedirect}
              >
                Sign out (Cognito)
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Welcome
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please sign in to continue.
          </Typography>

          <Divider />

          {/* <Stack direction={{ xs: "column", sm: "row" }} spacing={2}> */}
          <Stack spacing={2}>
            <Button variant="contained" onClick={() => auth.signinRedirect()}
              sx={{ 
                color: "#fff",
                borderColor: "#8F4E45",
                backgroundColor: "#8F4E45"
              }}
            >
              Sign in
            </Button>
            <Button variant="outlined" color="error" onClick={signOutRedirect}>
              Sign out
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default App;
