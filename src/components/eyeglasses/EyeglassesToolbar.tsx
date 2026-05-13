import { ArrowLeft, ChevronDown } from 'lucide-react';

type EyeglassesToolbarProps = {
  totalItems: number;
  filtersVisible: boolean;
  onToggleFilters: () => void;
};

export function EyeglassesToolbar({
  totalItems,
  filtersVisible,
  onToggleFilters,
}: EyeglassesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7dad8] pb-4">
      <div className="flex items-center gap-3 text-[14px] text-[#2a2d31]">
        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex items-center gap-2 font-medium text-[#222529]"
        >
          <ArrowLeft
            size={16}
            className={`transition-transform ${filtersVisible ? '' : 'rotate-180'}`}
          />
          {filtersVisible ? 'Hide filters' : 'Show filters'}
        </button>
        <span className="text-[#c4c8c4]">|</span>
        <span className="text-[#626972]">{totalItems} frames</span>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#222529]"
      >
        Featured
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
