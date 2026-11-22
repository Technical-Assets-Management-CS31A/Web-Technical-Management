import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logo from "../../../assets/newAclcLogo.webp";
import { NOT_FOUND_CONTENT as T } from "../../../constants/notFoundContent";
import type { NotFoundViewModel } from "../model/not-found-view-model";

export default function NotFoundView({ requestedPath, year, goBack }: NotFoundViewModel) {

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-8 sm:px-10">
      <header className="flex items-center gap-3">
        <img src={logo} alt={T.logoAlt} className="h-10 w-10 rounded-full ring-1 ring-slate-200" />
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-slate-900">{T.school}</span>
          <span className="block text-xs text-slate-500">{T.system}</span>
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md animate-fadeIn">
          <p className="text-sm font-semibold text-blue-600">{T.eyebrow}</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance">
            {T.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500">{T.description}</p>

          {requestedPath && (
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <span>{T.pathLabel}</span>
              <code className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[13px] text-slate-700">
                {requestedPath}
              </code>
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={goBack}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
            >
              <ArrowLeft className="h-4 w-4" />
              {T.secondaryButton}
            </button>
            <Link
              to="/home/dashboard"
              className="group flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30"
            >
              {T.primaryButton}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400">
        © {year} {T.footer}
      </footer>
    </div>
  );
}
