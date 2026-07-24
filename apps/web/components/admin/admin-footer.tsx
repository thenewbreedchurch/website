export function AdminFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 ${className}`}>
      &copy; {new Date().getFullYear()} The New Breed Church — Admin
    </footer>
  );
}
