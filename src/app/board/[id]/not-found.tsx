import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function BoardNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Board not found</h1>
        <p className="text-slate-500 text-sm mb-6">
          This board doesn&apos;t exist or may have been deleted.
        </p>
        <Link href="/">
          <Button>Back to boards</Button>
        </Link>
      </div>
    </div>
  );
}
