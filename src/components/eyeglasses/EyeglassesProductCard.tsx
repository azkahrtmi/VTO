import { Heart } from 'lucide-react';
import type { EyeglassesProduct } from './eyeglassesData';

type EyeglassesProductCardProps = {
  product: EyeglassesProduct;
};

function TryOnIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.152 2.902C2.152 2.764 2.264 2.652 2.402 2.652H4.402C4.816 2.652 5.152 2.316 5.152 1.902C5.152 1.488 4.816 1.152 4.402 1.152H2.402C1.436 1.152 0.652 1.936 0.652 2.902V4.902C0.652 5.316 0.988 5.652 1.402 5.652C1.816 5.652 2.152 5.316 2.152 4.902V2.902Z"
        fill="currentColor"
      />
      <path
        d="M10.548 1.902C10.548 2.316 10.884 2.652 11.298 2.652H13.298C13.436 2.652 13.548 2.764 13.548 2.902V4.902C13.548 5.316 13.884 5.652 14.298 5.652C14.712 5.652 15.048 5.316 15.048 4.902V2.902C15.048 1.936 14.265 1.152 13.298 1.152H11.298C10.884 1.152 10.548 1.488 10.548 1.902Z"
        fill="currentColor"
      />
      <path
        d="M2.152 13.798C2.152 13.936 2.264 14.048 2.402 14.048H4.402C4.816 14.048 5.152 14.384 5.152 14.798C5.152 15.212 4.816 15.548 4.402 15.548H2.402C1.436 15.548 0.652 14.764 0.652 13.798V11.798C0.652 11.384 0.988 11.048 1.402 11.048C1.816 11.048 2.152 11.384 2.152 11.798V13.798Z"
        fill="currentColor"
      />
      <path
        d="M13.548 13.798C13.548 13.936 13.436 14.048 13.298 14.048H11.298C10.884 14.048 10.548 14.384 10.548 14.798C10.548 15.212 10.884 15.548 11.298 15.548H13.298C14.265 15.548 15.048 14.764 15.048 13.798V11.798C15.048 11.384 14.712 11.048 14.298 11.048C13.884 11.048 13.548 11.384 13.548 11.798V13.798Z"
        fill="currentColor"
      />
      <path
        d="M5.334 6.587C5.777 6.193 6.344 5.97 6.936 5.958C7.527 5.945 8.103 6.144 8.562 6.518L8.714 6.642L8.866 6.518C9.312 6.154 9.87 5.955 10.445 5.955C11.019 5.955 11.578 6.154 12.023 6.518C12.469 6.881 12.773 7.385 12.883 7.943C12.994 8.501 12.904 9.081 12.629 9.581C12.383 10.03 12.014 10.406 11.561 10.69L11.384 10.795L8.714 12.332L6.044 10.795L5.867 10.69C5.414 10.406 5.045 10.03 4.798 9.581C4.524 9.081 4.433 8.501 4.544 7.943C4.655 7.385 4.958 6.881 5.404 6.518L5.334 6.587Z"
        fill="currentColor"
        opacity="0.14"
      />
    </svg>
  );
}

export function EyeglassesProductCard({
  product,
}: EyeglassesProductCardProps) {
  return (
    <article className="space-y-4">
      <div className="relative overflow-hidden rounded-[18px] bg-[#efefed] px-4 pb-4 pt-3">
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-md bg-white px-2 py-1 text-[10px] font-medium text-[#69707a] shadow-sm">
            {product.badge}
          </span>
        )}

        <div className="flex min-h-[196px] items-center justify-center px-3 pt-5">
          <img
            src={product.image}
            alt={`${product.brand} ${product.model}`}
            className="h-auto max-h-[108px] w-full object-contain mix-blend-multiply"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#7a8088] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
            aria-label={`Simpan ${product.model}`}
          >
            <Heart size={15} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#2a2d31] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
          >
            <TryOnIcon />
            Try on
          </button>
        </div>
      </div>

      <div className="space-y-3 px-1">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-['Outfit','Poppins',sans-serif] text-[17px] font-semibold text-[#232427]">
              {product.brand}
            </p>
            <p className="font-['Outfit','Poppins',sans-serif] text-[17px] text-[#232427]">
              {product.model}
            </p>
          </div>
          <p className="pb-1 text-[11px] font-medium text-[#3e4650]">
            {product.price}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.colors.map((color) => (
            <span
              key={`${product.model}-${color}`}
              className="block h-4.5 w-4.5 rounded-full border border-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <button
          type="button"
          className="w-full rounded-full bg-[#09372C] px-5 py-3 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[#0b4134]"
        >
          Select lenses and buy
        </button>
      </div>
    </article>
  );
}
