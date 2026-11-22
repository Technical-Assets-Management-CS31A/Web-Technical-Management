import { useNotFoundViewModel } from "../model/not-found-view-model";
import NotFoundView from "./not-found-view";

/** Shown for any unknown address (router defaultNotFoundComponent). */
export default function NotFoundScreen() {
  const vm = useNotFoundViewModel();
  return <NotFoundView {...vm} />;
}
