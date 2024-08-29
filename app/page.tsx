import { Toaster } from "react-hot-toast";
import { Main } from "./components/main";

export default function page() {
  return (
    <div className="w-full h-full">
      <Toaster />
      <main className="flex flex-col min-h-screen items-center p-3">
        <Main />
      </main>
    </div>
  );
}
