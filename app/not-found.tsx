import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-lg text-[#a0a0a0] mb-8">Fragrance not found</p>
      <Link href="/">
        <Button>Back to Browse</Button>
      </Link>
    </div>
  );
}
