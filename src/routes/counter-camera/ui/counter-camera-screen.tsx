import { useCounterCameraViewModel } from "../model/counter-camera-view-model";
import CounterCameraView from "./counter-camera-view";

/** Route entry: connects the view model to the view. */
export default function CounterCameraScreen() {
  const vm = useCounterCameraViewModel();
  return <CounterCameraView {...vm} />;
}
