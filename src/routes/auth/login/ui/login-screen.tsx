import { useLoginViewModel } from "../model/login-view-model";
import LoginView from "./login-view";

/** Route entry for / (sign-in). */
export default function LoginScreen() {
  const vm = useLoginViewModel();
  return <LoginView {...vm} />;
}
