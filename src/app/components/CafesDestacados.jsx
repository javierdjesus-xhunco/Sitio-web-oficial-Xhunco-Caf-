"use client";

import {
  useRef,
  useEffect,
  useState,
} from "react";

import CafeCard from "./CafeCard";
import cafes from "@/data/cafes";
import { getCafePricesClient } from "@/lib/getCafePricesClient";

export default function CafesDestacados() {
  const [productosDB, setProductosDB] =
    useState([]);

  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      const data = await getCafePricesClient();
      setProductosDB(data);
    }

    loadData();
  }, []);

  const startAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const slider = sliderRef.current;

      if (!slider) return;

      slider.scrollLeft += 2;

      if (
        slider.scrollLeft + slider.offsetWidth >=
        slider.scrollWidth - 10
      ) {
        slider.scrollLeft = 0;
      }
    }, 20);
  };

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

  const handleScroll = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    pauseAutoScroll();

    slider.scrollBy({
      left:
        direction *
        slider.offsetWidth *
        0.85,
      behavior: "smooth",
    });
  };

  const getProductoDB = (cafe) => {
    const productosCafe =
      productosDB.filter((item) => {
        const nombre =
          item.nombre
            ?.toLowerCase()
            .trim() || "";

        return nombre.includes(
          `xhunco ${cafe.dbMatch}`
        );
      });

    return (
      productosCafe.find((item) =>
        item.nombre
          ?.toLowerCase()
          .includes("grano")
      ) || productosCafe[0]
    );
  };

  return (
    <section className="py-28 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-14">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-[#31572c] mb-3">
              Xhunco Cafe
            </p>

            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Productos Destacados
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleScroll(-1)}
              className="h-12 w-12 rounded-full border"
              aria-label="Retroceder productos destacados"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => handleScroll(1)}
              className="h-12 w-12 rounded-full border"
              aria-label="Avanzar productos destacados"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          onMouseEnter={pauseAutoScroll}
          onTouchStart={pauseAutoScroll}
          className="flex gap-7 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {[...cafes, ...cafes].map((cafe, index) => {
            const productoDB =
              getProductoDB(cafe);

            return (
              <div
                key={`${cafe.slug}-${index}`}
                className="w-[320px] md:w-[380px] flex-shrink-0"
              >
                <CafeCard
                  cafe={cafe}
                  precioDB={
                    productoDB?.precio_web
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}