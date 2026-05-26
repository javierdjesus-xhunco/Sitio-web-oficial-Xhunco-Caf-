import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/app/components/Footer";
import { blogPosts, getBlogPostBySlug } from "@/data/blogPosts";

const SITE_URL = "https://www.xhunco.com";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado | Xhunco Café",
    };
  }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "Xhunco Café",
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: `${SITE_URL}${post.coverImage}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Xhunco Café",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Xhunco Café",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
  };

  const faqSchema =
    post.faqs?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-[#fffaf2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      <article>
        {/* HERO */}
        <header className="relative overflow-hidden border-b border-black/5 bg-[#fffaf2] px-6 pt-32 pb-16">
          <div className="absolute left-[-180px] top-0 h-[420px] w-[420px] rounded-full bg-[#31572c]/10 blur-3xl" />
          <div className="absolute right-[-180px] bottom-[-120px] h-[420px] w-[420px] rounded-full bg-[#c89b3c]/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center rounded-full border border-[#31572c]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#31572c] shadow-sm transition hover:bg-white"
              >
                ← Volver al blog
              </Link>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#31572c] px-4 py-2 text-sm font-semibold text-white">
                  {post.category}
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm ring-1 ring-black/5">
                  {formatDate(post.date)}
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm ring-1 ring-black/5">
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-[#1f2a1d] md:text-6xl">
                {post.title}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-700">
                {post.excerpt}
              </p>
            </div>

            <div className="rounded-[2.2rem] border border-white/70 bg-white p-4 shadow-xl shadow-black/5">
              <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#31572c] via-[#557a45] to-[#c89b3c] p-8 text-white">
                <div className="absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute bottom-[-90px] left-[-90px] h-56 w-56 rounded-full bg-black/10 blur-2xl" />

                <div className="relative min-h-[280px]">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/75">
                    Guía Xhunco
                  </p>

                  <h2 className="mt-6 max-w-sm text-3xl font-bold leading-tight">
                    Café, suministros y operación para negocios
                  </h2>

                  <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
                    Contenido creado para cafeterías, restaurantes, hoteles y
                    emprendedores que buscan mejorar su abastecimiento.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {post.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
              <div className="border-b border-black/5 bg-white px-7 py-6 md:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#31572c]">
                  Artículo
                </p>
              </div>

              <div className="p-7 md:p-10">
                {post.content.map((section, index) => (
                  <section
                    key={section.heading}
                    className={index === post.content.length - 1 ? "" : "mb-12"}
                  >
                    <h2 className="mb-5 text-2xl font-bold tracking-tight text-[#1f2a1d] md:text-3xl">
                      {section.heading}
                    </h2>

                    <div className="space-y-5">
                      {section.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-lg leading-8 text-neutral-700"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}

                {/* CTA PRINCIPAL */}
                <section className="mt-14 overflow-hidden rounded-[1.7rem] bg-[#31572c] p-7 text-white md:p-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <h2 className="text-2xl font-bold md:text-3xl">
                        ¿Buscas café o suministros para tu negocio?
                      </h2>

                      <p className="mt-4 max-w-2xl text-white/85">
                        Explora productos para cafeterías, restaurantes, hoteles
                        y negocios que necesitan abastecimiento constante.
                      </p>
                    </div>

                    <Link
                      href="/suministros"
                      className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-[#31572c] transition hover:bg-[#f3eadb]"
                    >
                      Ver suministros
                    </Link>
                  </div>
                </section>

                {/* FAQ */}
                {post.faqs?.length > 0 && (
                  <section className="mt-14">
                    <div className="mb-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#31572c]">
                        Dudas comunes
                      </p>

                      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a1d]">
                        Preguntas frecuentes
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {post.faqs.map((faq) => (
                        <div
                          key={faq.question}
                          className="rounded-2xl border border-black/5 bg-[#fffaf2] p-5"
                        >
                          <h3 className="text-lg font-bold text-[#1f2a1d]">
                            {faq.question}
                          </h3>

                          <p className="mt-2 leading-7 text-neutral-700">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#31572c]">
                  En este artículo
                </p>

                <div className="mt-5 space-y-3">
                  {post.content.map((section) => (
                    <div
                      key={section.heading}
                      className="rounded-2xl bg-[#fffaf2] px-4 py-3 text-sm font-semibold leading-6 text-[#1f2a1d]"
                    >
                      {section.heading}
                    </div>
                  ))}
                </div>
              </div>

              {relatedPosts.length > 0 && (
                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#31572c]">
                    Más guías
                  </p>

                  <div className="mt-5 space-y-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="block rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#31572c]/20 hover:bg-[#fffaf2]"
                      >
                        <span className="text-xs font-semibold text-[#31572c]">
                          {related.category}
                        </span>

                        <h3 className="mt-2 text-sm font-bold leading-6 text-[#1f2a1d]">
                          {related.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-600">
                          {related.excerpt}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[2rem] bg-[#1f2a1d] p-6 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                  Xhunco Café
                </p>

                <h2 className="mt-3 text-xl font-bold">
                  Café y suministros para negocios
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  Encuentra productos pensados para operación, calidad y
                  abastecimiento constante.
                </p>

                <Link
                  href="/blog"
                  className="mt-5 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Ver más artículos
                </Link>
              </div>
            </aside>
          </div>
        </section>

         <Footer />
      </article>
    </main>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}