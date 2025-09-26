import { Button } from "@/components/retroui/Button";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-2xl">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">RetroUI Demo</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            A demonstration of RetroUI components installed in Next.js
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🚀</Button>
            </div>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Installation Success</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>shadcn/ui initialized</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>RetroUI utilities installed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Button component added</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Button asChild>
            <a
              href="https://www.retroui.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit RetroUI
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://www.retroui.dev/docs/install/nextjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Docs
            </a>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          RetroUI successfully installed and ready to use!
        </p>
      </footer>
    </div>
  );
}
