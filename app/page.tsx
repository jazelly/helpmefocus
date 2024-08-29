import { Toaster } from "react-hot-toast";
import { Main } from "./components/main";

export default function page() {
  return (
    <div className="w-full h-full">
      <Toaster />
      <Main />
    </div>
  );
}
