import { useLoansViewModel } from "../model/loans-view-model";
import LoansView from "./loans-view";

/** Route entry: connects the view model to the view. */
export default function LoansScreen() {
  const vm = useLoansViewModel();
  return <LoansView {...vm} />;
}
