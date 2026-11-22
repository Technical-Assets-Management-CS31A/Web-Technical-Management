import { useLoanDetailViewModel } from "../model/loan-detail-view-model";
import LoanDetailView from "./loan-detail-view";

/** Route entry: connects the view model to the view. */
export default function LoanDetailScreen() {
  const vm = useLoanDetailViewModel();
  return <LoanDetailView {...vm} />;
}
