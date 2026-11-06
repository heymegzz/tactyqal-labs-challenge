export function Mark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" width="34" height="34">
      <rect width="36" height="36" rx="7" fill="#ff6447" />
      <path d="M7 9h23l-2 6h-8l-4 13h-6l4-13H5z" fill="#24251f" />
      <path d="M22 19h7l-2 6h-7z" fill="#24251f" />
    </svg>
  );
}
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="Tactyqal Labs home">
      <Mark />
      <b>
        tactyqal<span>labs</span>
      </b>
    </a>
  );
}
