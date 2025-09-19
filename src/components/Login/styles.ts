import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 32,
    alignItems: "center",
  },
  logoContainer: {
    borderRadius: 48,
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  eyeButton: {
    padding: 2,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
  },
});
