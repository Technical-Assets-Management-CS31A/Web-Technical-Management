import { useAuthCardsViewModel } from "../model/auth-cards-view-model";
import AuthCardsView from "./auth-cards-view";

/** Route entry: connects the view model to the view. */
export default function AuthCardsScreen() {
  const vm = useAuthCardsViewModel();
  return <AuthCardsView {...vm} />;
}
