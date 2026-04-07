import GlobalApi from '@/app/_services/GlobalApi';

export async function generateMetadata({ params }) {
  const { businessId } = params;

  try {
    const resp = await GlobalApi.getBusinessById(businessId);
    const business = resp?.businessList;
    
    // Corrected syntax: index pulls the first image from the gallery
    const shareImage = business?.images?.[0]?.url || '/logo.png';

    return {
      title: `${business?.name || 'Service Provider'} | ServiceHub`,
      description: business?.about?.substring(0, 160) || 'Book professional services on ServiceHub',
      openGraph: {
        title: business?.name,
        description: business?.about,
        images: [{
          url: shareImage,
          width: 1200,
          height: 630,
        }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: business?.name,
        description: business?.about,
        images: [shareImage],
      },
    };
  } catch (error) {
    return { title: "ServiceHub" };
  }
}

export default function DetailsLayout({ children }) {
  return <>{children}</>;
}