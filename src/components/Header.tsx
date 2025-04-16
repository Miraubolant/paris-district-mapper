
import { MountainSnow } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-purple-100 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MountainSnow className="h-8 w-8 text-purple-700" />
          <h1 className="text-2xl font-serif font-bold text-purple-900">
            Paris District Mapper
          </h1>
        </div>
        <nav>
          <ul className="flex gap-6">
            <li>
              <a href="#" className="text-purple-700 hover:text-purple-900 transition">
                À propos
              </a>
            </li>
            <li>
              <a href="#" className="text-purple-700 hover:text-purple-900 transition">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
