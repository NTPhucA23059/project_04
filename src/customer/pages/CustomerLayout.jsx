export default function CustomerLayout({ children }) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <main>
        {children}
      </main>
    </div>
  );
}
