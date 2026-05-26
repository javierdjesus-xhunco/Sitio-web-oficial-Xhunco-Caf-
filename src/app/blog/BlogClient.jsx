"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Search,
  SlidersHorizontal,
  Coffee,
  X,
} from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

function normalizeText(value = "") {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .trim();
}

export default function BlogClient() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    return ["Todos", ...new Set(blogPosts.map((post) => post.category))];
  }, []);

  const featuredPost = blogPosts[0];

  const filteredPosts = useMemo(() => {
    const search = normalizeText(query);
    const searchTerms = search.split(/\s+/).filter(Boolean);

    return blogPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "Todos" || post.category === activeCategory;

      const searchableText = normalizeText(
        [
          post.title,
          post.excerpt,
          post.category,
          post.keyword,
          ...(post.keywords || []),
          ...(post.content || []).flatMap((section) => [
            section.heading,
            ...(section.body || []),
          ]),
          ...(post.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
        ].join(" ")
      );

      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => searchableText.includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  const articleList = filteredPosts.filter(
    (post) => post.slug !== featuredPost?.slug
  );

  const recommendedPosts = blogPosts
    .filter((post) => post.slug !== featuredPost?.slug)
    .slice(0, 3);

  const hasSearch = query.trim().length > 0;

  function clearSearch() {
    setQuery("");
  }

  function clearFilters() {
    setQuery("");
    setActiveCategory("Todos");
  }

  return (
    <>
      {/* HERO CORPORATIVO */}
      <section className="relative overflow-hidden border-b border-[#31572c]/10 bg-[#fbf7ef] px-5 pt-28 pb-10 sm:px-6 sm:pt-32 md:pb-12">
        <div className="absolute left-[-260px] top-[-180px] h-[520px] w-[520px] rounded-full bg-[#31572c]/10 blur-3xl" />
        <div className="absolute right-[-260px] bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#e8f0df] blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#31572c]/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#31572c] shadow-sm">
              <BookOpen className="h-4 w-4" />
              Centro de recursos Xhunco
            </div>

            <h1 className="max-w-5xl text-4xl font-bold tracking-[-0.045em] text-[#1f2a1d] sm:text-5xl md:text-6xl lg:text-7xl">
              Guías profesionales para negocios de café
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-700 sm:text-lg md:text-xl">
              Contenido práctico y organizado para cafeterías, restaurantes,
              hoteles y negocios que buscan tomar mejores decisiones sobre café,
              suministros, inventario y operación.
            </p>
          </div>
        </div>
      </section>

      {/* BUSCADOR Y FILTROS */}
      <section className="sticky top-0 z-20 border-b border-[#31572c]/10 bg-[#fbf7ef]/90 px-5 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#31572c]" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por tema, categoría o palabra clave..."
                className="w-full rounded-full border border-[#31572c]/10 bg-white py-3 pl-12 pr-28 text-sm font-medium text-[#1f2a1d] outline-none transition placeholder:text-neutral-400 focus:border-[#31572c]/30 focus:ring-4 focus:ring-[#31572c]/10"
              />

              {hasSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-[#e8f0df] px-4 py-2 text-xs font-bold text-[#31572c] transition hover:bg-[#31572c] hover:text-white"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:max-w-[600px] lg:justify-end">
              {categories.map((category) => {
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={[
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                      active
                        ? "border-[#31572c] bg-[#31572c] text-white"
                        : "border-[#31572c]/10 bg-white text-[#31572c] hover:bg-[#e8f0df]",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="px-5 py-10 sm:px-6 md:py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
          {/* SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[2rem] border border-[#31572c]/10 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#31572c]" />
                  <h2 className="text-lg font-bold text-[#1f2a1d]">
                    Categorías
                  </h2>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => {
                    const active = activeCategory === category;
                    const count =
                      category === "Todos"
                        ? blogPosts.length
                        : blogPosts.filter((post) => post.category === category)
                            .length;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={[
                          "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition",
                          active
                            ? "bg-[#31572c] text-white"
                            : "bg-[#fbf7ef] text-[#1f2a1d] hover:bg-[#e8f0df]",
                        ].join(" ")}
                      >
                        <span>{category}</span>
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-xs",
                            active
                              ? "bg-white/15 text-white"
                              : "bg-white text-[#31572c]",
                          ].join(" ")}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(hasSearch || activeCategory !== "Todos") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#31572c]/15 bg-white px-5 py-3 text-sm font-bold text-[#31572c] transition hover:bg-[#e8f0df]"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="rounded-[2rem] border border-[#31572c]/10 bg-[#e8f0df] p-6">
                <Coffee className="h-6 w-6 text-[#31572c]" />

                <h3 className="mt-4 text-xl font-bold text-[#1f2a1d]">
                  Café y suministros para negocios
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  Explora productos para cafeterías, restaurantes y hoteles.
                </p>

                <Link
                  href="/suministros"
                  className="mt-5 inline-flex rounded-full bg-[#31572c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#25441f]"
                >
                  Ver suministros
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="space-y-9">
            {/* DESTACADO */}
            {featuredPost && activeCategory === "Todos" && !hasSearch && (
              <section>
                <SectionTitle
                  eyebrow="Artículo destacado"
                  title="Guía principal"
                  description="Un punto de partida para conocer cómo elegir proveedor, café y suministros de forma profesional."
                />

                <article className="overflow-hidden rounded-[2.4rem] border border-black/5 bg-white shadow-xl shadow-black/5">
                  <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="group relative min-h-[300px] overflow-hidden bg-[#31572c] sm:min-h-[380px]"
                    >
                      <Image
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        fill
                        priority
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 1280px) 100vw, 50vw"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute left-5 top-5">
                        <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                          Destacado
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-col justify-center p-7 sm:p-9 md:p-10">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#31572c]/10 px-4 py-2 text-sm font-bold text-[#31572c]">
                          {featuredPost.category}
                        </span>

                        <span className="text-sm font-medium text-neutral-500">
                          {formatDate(featuredPost.date)} ·{" "}
                          {featuredPost.readTime}
                        </span>
                      </div>

                      <h2 className="text-3xl font-bold tracking-tight text-[#1f2a1d] md:text-4xl">
                        {featuredPost.title}
                      </h2>

                      <p className="mt-4 text-base leading-8 text-neutral-700">
                        {featuredPost.excerpt}
                      </p>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="mt-7 inline-flex w-fit items-center rounded-full bg-[#31572c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#25441f]"
                      >
                        Leer guía completa
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* RECOMENDADOS */}
            {recommendedPosts.length > 0 &&
              activeCategory === "Todos" &&
              !hasSearch && (
                <section>
                  <SectionTitle
                    eyebrow="Lecturas recomendadas"
                    title="Guías esenciales"
                    description="Artículos clave para iniciar sin saturar la vista con todo el contenido."
                  />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {recommendedPosts.map((post) => (
                      <SmallCard key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              )}

            {/* LISTADO */}
            <section>
              <SectionTitle
                eyebrow={
                  activeCategory === "Todos"
                    ? "Todos los artículos"
                    : activeCategory
                }
                title={
                  hasSearch
                    ? `Resultados para “${query}”`
                    : activeCategory === "Todos"
                    ? "Últimos artículos"
                    : `Artículos sobre ${activeCategory.toLowerCase()}`
                }
                description={`${filteredPosts.length} artículo${
                  filteredPosts.length === 1 ? "" : "s"
                } encontrado${filteredPosts.length === 1 ? "" : "s"}.`}
              />

              {(hasSearch || activeCategory !== "Todos") && (
                <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[#31572c]/10 bg-white p-4 shadow-sm">
                  {hasSearch && (
                    <span className="rounded-full bg-[#e8f0df] px-4 py-2 text-sm font-bold text-[#31572c]">
                      Búsqueda: {query}
                    </span>
                  )}

                  {activeCategory !== "Todos" && (
                    <span className="rounded-full bg-[#e8f0df] px-4 py-2 text-sm font-bold text-[#31572c]">
                      Categoría: {activeCategory}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full bg-[#31572c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#25441f]"
                  >
                    <X className="h-4 w-4" />
                    Limpiar todo
                  </button>
                </div>
              )}

              {articleList.length > 0 ? (
                <div className="space-y-4">
                  {articleList.map((post, index) => (
                    <ArticleRow key={post.slug} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-[#31572c]/10 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-bold text-[#1f2a1d]">
                    No encontramos artículos con esa búsqueda.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Prueba buscando café, cafe, proveedor, suministros,
                    inventario, menú, menu, cafetería o cafeteria.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#31572c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#25441f]"
                  >
                    <X className="h-4 w-4" />
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .xhunco-fade-up {
          animation: fadeInUp 520ms ease-out both;
        }
      `}</style>
    </>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#31572c]/10 pb-4 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#31572c]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a1d] md:text-4xl">
          {title}
        </h2>
      </div>

      {description && (
        <p className="max-w-xl text-sm leading-6 text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}

function SmallCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <article>
        <div className="relative h-44 overflow-hidden bg-[#31572c]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <Meta post={post} />

          <h3 className="mt-3 text-lg font-bold leading-tight text-[#1f2a1d] transition group-hover:text-[#31572c]">
            {post.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function ArticleRow({ post, index }) {
  return (
    <article
      className="xhunco-fade-up group overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <Link
          href={`/blog/${post.slug}`}
          className="relative min-h-[220px] overflow-hidden bg-[#31572c] md:min-h-full"
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 260px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        </Link>

        <div className="p-6 md:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#31572c]/10 px-3 py-1.5 text-xs font-bold text-[#31572c]">
              {post.category}
            </span>

            <Meta post={post} />
          </div>

          <h3 className="text-2xl font-bold leading-tight text-[#1f2a1d] transition group-hover:text-[#31572c]">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600 md:text-base md:leading-7">
            {post.excerpt}
          </p>

          <Link
            href={`/blog/${post.slug}`}
            className="mt-5 inline-flex items-center rounded-full bg-[#e8f0df] px-5 py-3 text-sm font-bold text-[#31572c] transition hover:bg-[#31572c] hover:text-white"
          >
            Leer artículo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Meta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
      <span>{formatDate(post.date)}</span>
      <span>•</span>
      <span>{post.readTime}</span>
    </div>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}