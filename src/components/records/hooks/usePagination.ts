import { useState, useMemo } from "react";

// Verbatim from the canonical SeidorApps (rendiciones) pattern — generic client-side
// paginator with ellipsis page numbers.
export function usePagination<T>(data: T[], initialItemsPerPage = 10) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(initialItemsPerPage);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPorPagina));
  const safePage = Math.min(paginaActual, totalPages);

  const paginatedData = useMemo(() => {
    return data.slice((safePage - 1) * itemsPorPagina, safePage * itemsPorPagina);
  }, [data, safePage, itemsPorPagina]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const changeItemsPerPage = (items: number) => {
    setItemsPorPagina(items);
    setPaginaActual(1);
  };

  return {
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    changeItemsPerPage,
    totalPages,
    safePage,
    paginatedData,
    pageNumbers,
  };
}
