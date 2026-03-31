import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { templates } from "@/data/templates";

export async function generateStaticParams() {
  return templates.map((t) => ({
    slug: t.slug,
  }));
}

export default function TemplatePage({
  params,
}: {
  params: { slug: string };
}) {
  const template = templates.find((t) => t.slug === params.slug);

  if (!template) notFound();

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">{template.title}</h1>
        <p className="text-neutral-600 mb-6">{template.description}</p>
      </div>
      <Footer />
    </main>
  );
}
