"use client";

import { useRef, useEffect, useState } from "react";

import CafeCard from "./CafeCard";

import cafes from "@/data/cafes";

import { getCafePricesClient } from "@/lib/getCafePricesClient";

export default function CafesDestacados() {

  const [productosDB, setProductosDB] =
    useState([]);

  const sliderRef = useRef(null);

  const intervalRef = useRef(null);

  const timeoutRef = useRef(null);

  // =========================
  // CARGAR PRECIOS SUPABASE
  // =========================

  useEffect(() => {

    async function loadData() {

const data =
  await getCafePricesClient();

      setProductosDB(data);
    }

    loadData();

  }, []);

  // =========================
  // AUTOSCROLL
  // =========================

  const startAutoScroll = () => {

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {

      const slider = sliderRef.current;

      if (!slider) return;

      slider.scrollLeft += 1;

      if (
        slider.scrollLeft + slider.offsetWidth >=
        slider.scrollWidth
      ) {
        slider.scrollTo({
          left: 0,
          behavior: "auto",
        });
      }

    }, 20);
  };

  // =========================
  // PAUSA TEMPORAL
  // =========================

  const pauseAutoScroll = () => {

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, 4000);
  };

  useEffect(() => {

    startAutoScroll();

    return () => {

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

  }, []);

  // =========================
  // BOTONES
  // =========================

  const handleScroll = (direction) => {

    const slider = sliderRef.current;

    if (!slider) return;

    pauseAutoScroll();

    const offset =
      slider.offsetWidth * 0.85;

    slider.scrollBy({
      left: direction * offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-28 bg-gray-50 overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-14">

          <div>

            <p className="uppercase tracking-[0.3em] text-sm text-[#31572c] mb-3">
              Xhunco Coffee
            </p>

            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Productos destacados
            </h2>

          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                handleScroll(-1)
              }
              className="h-12 w-12 rounded-full border border-gray-300 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() =>
                handleScroll(1)
              }
              className="h-12 w-12 rounded-full border border-gray-300 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              →
            </button>

          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-7 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {[...cafes, ...cafes].map(
            (cafe, index) => {

              const productoDB =
                productosDB.find(
                  (item) =>
                    item.sku === cafe.sku
                );

              return (
                <div
                  key={index}
                  className="min-w-[320px] md:min-w-[380px] flex-shrink-0"
                >
                  <CafeCard
                    cafe={cafe}
                    precioDB={
                      productoDB?.precio_web
                    }
                  />
                </div>
              );
            }
          )}
        </div>

      </div>
    </section>
  );
}