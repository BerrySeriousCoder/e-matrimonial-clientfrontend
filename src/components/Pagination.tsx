import React from 'react';

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Smart pagination logic
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Calculate the range around current page
    const leftBound = Math.max(2, page - delta);
    const rightBound = Math.min(totalPages - 1, page + delta);

    // Add ellipsis if there's a gap between first page and left bound
    if (leftBound > 2) {
      range.push('...');
    }

    // Add pages around current page
    for (let i = leftBound; i <= rightBound; i++) {
      range.push(i);
    }

    // Add ellipsis if there's a gap between right bound and last page
    if (rightBound < totalPages - 1) {
      range.push('...');
    }

    // Always show last page (if it's not already included)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center gap-2 mt-8 mb-4 flex-wrap">
      {/* First Page Button */}
      <button
        className="newspaper-btn newspaper-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        title="Go to first page"
      >
        &laquo; First
      </button>

      {/* Previous Button */}
      <button
        className="newspaper-btn newspaper-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        title="Previous page"
      >
        &lt; Prev
      </button>

      {/* Page Numbers */}
      {visiblePages.map((pageNum, index) => (
        <React.Fragment key={index}>
          {pageNum === '...' ? (
            <span className="px-3 py-2 text-gray-500 font-serif text-sm">...</span>
          ) : (
            <button
              className={`newspaper-btn ${
                page === pageNum 
                  ? 'newspaper-btn-primary' 
                  : 'newspaper-btn-secondary'
              }`}
              onClick={() => onPageChange(pageNum as number)}
              title={`Go to page ${pageNum}`}
            >
              {pageNum}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        className="newspaper-btn newspaper-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        title="Next page"
      >
        Next &gt;
      </button>

      {/* Last Page Button */}
      <button
        className="newspaper-btn newspaper-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        title="Go to last page"
      >
        Last &raquo;
      </button>
    </nav>
  );
} 