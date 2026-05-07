const navItems = ['Eyeglasses', 'Sunglasses', 'Brand', 'Store', 'News', 'About'];

export function LandingNavbar() {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-[3.8rem] py-5 max-[920px]:relative max-[920px]:bg-transparent max-[920px]:px-3 max-[920px]:py-4">
      <nav
        className="hidden h-5 w-[471px] items-center gap-[30px] max-[920px]:hidden min-[921px]:flex"
        aria-label="Primary"
      >
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className="font-['Outfit','Poppins',sans-serif] text-[16px] leading-[100%] font-normal tracking-[0] text-[#ffffff] no-underline transition-opacity duration-200 hover:opacity-80"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-[1.05rem] max-[920px]:w-full max-[920px]:justify-start">
        <button
          className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[rgba(255,255,255,0.78)] bg-[rgba(255,255,255,0.08)] px-[1.05rem] py-2 text-[0.98rem] text-[#f7f1e8] transition-transform duration-200 hover:-translate-y-px"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75 0C7.82164 0 5.93657 0.571828 4.33319 1.64317C2.72982 2.71452 1.48013 4.23726 0.742179 6.01884C0.00422452 7.80042 -0.188858 9.76082 0.187348 11.6521C0.563554 13.5434 1.49215 15.2807 2.85571 16.6443C4.21928 18.0079 5.95656 18.9365 7.84787 19.3127C9.73919 19.6889 11.6996 19.4958 13.4812 18.7578C15.2627 18.0199 16.7855 16.7702 17.8568 15.1668C18.9282 13.5634 19.5 11.6784 19.5 9.75C19.4973 7.16498 18.4692 4.68661 16.6413 2.85872C14.8134 1.03084 12.335 0.00272983 9.75 0ZM4.695 16.2656C5.23757 15.4171 5.98501 14.7188 6.86843 14.2351C7.75185 13.7513 8.74283 13.4978 9.75 13.4978C10.7572 13.4978 11.7482 13.7513 12.6316 14.2351C13.515 14.7188 14.2624 15.4171 14.805 16.2656C13.3597 17.3897 11.581 17.9999 9.75 17.9999C7.91905 17.9999 6.14031 17.3897 4.695 16.2656ZM6.75 9C6.75 8.40666 6.92595 7.82664 7.2556 7.33329C7.58524 6.83994 8.05378 6.45542 8.60195 6.22836C9.15013 6.0013 9.75333 5.94189 10.3353 6.05764C10.9172 6.1734 11.4518 6.45912 11.8713 6.87868C12.2909 7.29824 12.5766 7.83279 12.6924 8.41473C12.8081 8.99667 12.7487 9.59987 12.5216 10.148C12.2946 10.6962 11.9101 11.1648 11.4167 11.4944C10.9234 11.8241 10.3433 12 9.75 12C8.95435 12 8.19129 11.6839 7.62868 11.1213C7.06607 10.5587 6.75 9.79565 6.75 9ZM15.915 15.2259C15.0785 14.0138 13.9024 13.0761 12.5344 12.5306C13.2692 11.9519 13.8054 11.1585 14.0684 10.2608C14.3315 9.3632 14.3082 8.4059 14.002 7.52207C13.6957 6.63825 13.1216 5.87183 12.3596 5.3294C11.5975 4.78696 10.6854 4.49548 9.75 4.49548C8.81462 4.49548 7.90248 4.78696 7.14044 5.3294C6.37839 5.87183 5.80432 6.63825 5.49805 7.52207C5.19179 8.4059 5.16855 9.3632 5.43157 10.2608C5.69459 11.1585 6.2308 11.9519 6.96563 12.5306C5.59765 13.0761 4.42147 14.0138 3.585 15.2259C2.52804 14.0373 1.8372 12.5685 1.59567 10.9964C1.35415 9.42427 1.57224 7.81584 2.22368 6.36478C2.87512 4.91372 3.93213 3.68192 5.26745 2.81769C6.60276 1.95346 8.15943 1.49367 9.75 1.49367C11.3406 1.49367 12.8973 1.95346 14.2326 2.81769C15.5679 3.68192 16.6249 4.91372 17.2763 6.36478C17.9278 7.81584 18.1459 9.42427 17.9043 10.9964C17.6628 12.5685 16.972 14.0373 15.915 15.2259Z" fill="white"/>
          </svg>
          Sign in
        </button>
        <button
          className="relative h-[38px] w-[38px] rounded-full border border-transparent bg-transparent transition-transform duration-200 hover:-translate-y-px"
          type="button"
          aria-label="Search"
        >
          <img className="m-auto h-[18px] w-[18px] object-contain brightness-0 invert" src="/landing/icon/search.png" alt="" />
        </button>
        <button
          className="relative h-[38px] w-[38px] rounded-full border border-transparent bg-transparent transition-transform duration-200 hover:-translate-y-px"
          type="button"
          aria-label="Wishlist"
        >
          <img className="m-auto h-[18px] w-[18px] object-contain brightness-0 invert" src="/landing/icon/heart.png" alt="" />
        </button>
        <button
          className="relative h-[38px] w-[38px] rounded-full border border-transparent bg-transparent transition-transform duration-200 hover:-translate-y-px"
          type="button"
          aria-label="Cart"
        >
          <img className="m-auto h-[18px] w-[18px] object-contain brightness-0 invert" src="/landing/icon/cart.png" alt="" />
          <span className="absolute right-[6px] top-[8px] h-[7px] w-[7px] rounded-full bg-[#f72c3a]" />
        </button>
      </div>
    </div>
  );
}
