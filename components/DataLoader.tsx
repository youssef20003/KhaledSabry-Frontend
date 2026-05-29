export function DataLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="data-loader" role="status" aria-live="polite" aria-label={label}>
      <div className="loader-logo-wrap">
        <img className="loader-logo" src="/Logo.png" alt="MAK-Z" />
      </div>
      <span className="loader-wordmark">{label}</span>
    </div>
  );
}
