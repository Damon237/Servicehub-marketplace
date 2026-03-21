import Hero from "./_components/Hero";
import CategoryList from "./_components/CategoryList";
import GlobalApi from "./_services/GlobalApi";
import BusinessList from "./_components/BusinessList";

export const revalidate = 0;

export default async function Home() {
  // Fetching data on the server side
  const categoryResp = await GlobalApi.getCategory();
  const businessResp = await GlobalApi.getAllBusinessList();

  return (
    <div>
      <Hero />
      <CategoryList categoryList={categoryResp?.categories || []} />
      <BusinessList 
        businessList={businessResp?.businessLists || []}
        title={'Popular Business'} 
      />
    </div>
  );
}