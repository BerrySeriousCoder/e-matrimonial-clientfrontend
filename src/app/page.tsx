import HomePageClient from '../components/HomePageClient';

export default async function Page() {
  // Fetch first page server-side
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?page=1`, { cache: 'no-store' });
  const data = await res.json();

  // Log the raw data for debugging

  // Deep serialize to ensure plain object
  const plainData = JSON.parse(JSON.stringify(data));

  return <HomePageClient initialData={plainData} />;
}
