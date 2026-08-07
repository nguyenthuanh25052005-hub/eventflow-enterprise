import { useLocation } from "react-router-dom";
export default function ComingSoon() {
  const title = useLocation()
    .pathname.split("/")
    .filter(Boolean)
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">NEXT MODULE</span>
          <h1>{title || "Module"}</h1>
          <p>
            This workspace is already routed and ready for the next
            implementation sprint.
          </p>
        </div>
      </header>
      <div className="panel empty-large">Module scaffold ready.</div>
    </div>
  );
}
