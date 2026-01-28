"use client";

import { useEffect, useMemo, useState } from "react";

type Suministro = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string | null;
  presentacion: string | null;
  precio: number;
  unidad: string | null;
  stock: number;
  activo: boolean;
};

type ProductoUI = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  imagen: string;
  disponible: boolean;
  stock: number;
  activo: boolean;
  presentacion?: string | null;
  unidad?: string | null;
};

const ordenarOpciones = [
  { value: "az", label: "Alfabéticamente A-Z" },
  { value: "precio", label: "Precio" },
] as const;

function Filtros(props: {
  disponibilidad: string;
  setDisponibilidad: (v: string) => void;
  orden: string;
  setOrden: (v: string) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  sugerencias: string[];
}) {
  const {
    disponibilidad,
    setDisponibilidad,
    orden,
    setOrden,
    busqueda,
    setBusqueda,
    sugerencias,
  } = props;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <label className="flex flex-col text-sm text-gray-600">
        Disponibilidad
        <select
          className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
          value={disponibilidad}
          onChange={(event) => setDisponibilidad(event.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </label>

      <label className="flex flex-col text-sm text-gray-600">
        Ordenar
        <select
          className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
          value={orden}
          onChange={(event) => setOrden(event.target.value)}
        >
          {ordenarOpciones.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </label>

      <div className="relative flex-1 min-w-[220px]">
        <label className="flex flex-col text-sm text-gray-600">
          Buscar
          <input
            className="mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800"
            placeholder="Busca por nombre del producto"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>

        {busqueda && sugerencias.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {sugerencias.map((sugerencia) => (
              <li
                key={sugerencia}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {sugerencia}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CatalogoSeccion(props: {
  titulo: string;
  descripcion?: string;
  categoria: string;
  productos: ProductoUI[];
  cantidades: Record<string, number>;
  onIncrementar: (sku: string, stock: number) => void;
  onDecrementar: (sku: string) => void;
  onAgregarCarrito: (p: ProductoUI) => void;
}) {
  const {
    titulo,
    descripcion,
    categoria,
    productos,
    cantidades,
    onIncrementar,
    onDecrementar,
    onAgregarCarrito,
  } = props;

  return (
    <section className="max-w-6xl mx-auto px-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{titulo}</h2>
          {descripcion ? <p className="mt-2 text-gray-600">{descripcion}</p> : null}
        </div>
        <span className="text-sm text-gray-500">{categoria}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {productos.length > 0 ? (
          productos.map((producto) => {
            const cantidad = cantidades[producto.sku] ?? 0;

            const estado = !producto.activo
              ? "Inactivo"
              : producto.stock > 0
              ? "Disponible"
              : "Agotado";

            const sinInventario = !producto.activo || producto.stock <= 0;

            return (
              <article
                key={producto.sku}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{producto.categoria}</span>
                  <span>{estado}</span>
                </div>

                <div className="mt-4 h-32 rounded-xl bg-gray-100" />

                <h3 className="mt-6 text-lg font-semibold">{producto.nombre}</h3>

                <p className="mt-2 text-sm text-gray-600">{producto.descripcion}</p>

                <div className="mt-3 text-xs text-gray-500">
                  {producto.presentacion ? (
                    <div>
