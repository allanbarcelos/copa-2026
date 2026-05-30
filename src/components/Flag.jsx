export default function Flag({ code, className = '' }) {
  if (!code) return <span className={`fi fi-placeholder ${className}`} />
  return <span className={`fi fi-${code} fis ${className}`} />
}
