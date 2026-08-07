export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-box">
      {Icon && (
        <div className="empty-icon">
          <Icon size={22} />
        </div>
      )}
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}
