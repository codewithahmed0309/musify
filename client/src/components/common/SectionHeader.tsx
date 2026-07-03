export default function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg md:text-xl font-bold tracking-tight mb-3 mt-6 first:mt-0">
      {title}
    </h2>
  );
}