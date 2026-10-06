import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "익명 고민 편지함",
  description: "고민을 익명으로 부치고, 누군가의 고민에 답장을 남기는 편지함",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="page">
          <header className="masthead">
            <Link href="/" className="brand"><span className="brand-mark" aria-hidden="true">✉</span> 익명 고민 편지함</Link>
            <span className="session">SESSION 06</span>
          </header>
          {children}
          <footer>이름 없이 건네는 고민과 위로<span>Next.js + Supabase</span></footer>
        </div>
      </body>
    </html>
  );
}
