import type { Route } from "./+types/home";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          ながらかいご
        </h1>
        <p className="text-xl text-muted-foreground">
          AIによる介護効率化サービス
        </p>
      </div>
    </div>
  );
}
