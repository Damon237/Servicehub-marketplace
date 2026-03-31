import { gql, request } from "graphql-request";

const MASTER_URL = `https://eu-west-2.cdn.hygraph.com/content/${process.env.NEXT_PUBLIC_MASTER_URL_KEY}/master`;

const executeQuery = async (query, variables = {}) => {
  try {
    const result = await request(MASTER_URL, query, variables);
    return result;
  } catch (error) {
    console.error("❌ GraphQL Request Error:", error);
    throw error;
  }
};

// --- CATEGORY ---
const getCategory = async () => {
  const query = gql`query Category { categories { bgcolor { hex } id name icon { url } } }`;
  return executeQuery(query);
};

// --- BUSINESS QUERIES ---
const getAllBusinessList = async () => {
  const query = gql`
    query BusinessList {
      businessLists(first: 100, orderBy: createdAt_DESC) { 
        about 
        address 
        category { name } 
        contactPerson 
        email 
        images { url } 
        id 
        name
        createdAt  
        location { latitude longitude }
      }
    }
  `;
  return executeQuery(query);
};

const getBusinessByCategory = async (category) => {
  if (!category) throw new Error("Category name is required");
  const query = gql`
    query GetBusinessByCategory($category: String!) {
      businessLists(where: { category: { name: $category } }) {
        about
        address
        category { name }
        contactPerson
        email
        id
        name
        images { url }
        location {
          latitude
          longitude
        }
      }
    }
  `;
  return executeQuery(query, { category });
};

// --- GLOBALAPI.JS ---

const getBusinessById = async (id) => {
  const query = gql`
    query GetBusinessById($id: ID!) {
      businessList(where: { id: $id }) {
        about 
        address 
        category { name } 
        contactPerson 
        email 
        id 
        name 
        images { url }
       
        location {
          latitude
          longitude
        }
      }
    }
  `;
  return executeQuery(query, { id });
};

// --- BOOKING LOGIC ---
const createNewBooking = async (businessId, date, time, userEmail, userName) => {
  const mutation = gql`
    mutation CreateBooking($businessId: ID!, $date: String!, $time: String!, $userEmail: String!, $userName: String!) {
      createBooking(data: {
        bookingStatut: booked,
        businessList: { connect: { id: $businessId } }, 
        date: $date, 
        time: $time, 
        userEmail: $userEmail, 
        userName: $userName
      }) { id }
      
      publishManyBookings(where: { userEmail: $userEmail }, to: [PUBLISHED]) {
        count
      }
    }
  `;
  return executeQuery(mutation, { businessId, date, time, userEmail, userName });
};

// --- PROVIDER DASHBOARD LOGIC ---
const getBusinessByEmail = async (email) => {
  const query = gql`
    query GetBusinessByEmail($email: String!) {
      businessLists(where: { email: $email }) {
        id name about address contactPerson email category { name } images { url }
      }
    }
  `;
  const result = await executeQuery(query, { email });
  return result?.businessLists[0]; 
};

const GetUserBookingHistory = async (userEmail) => {
  const query = gql`
    query GetUserBookingHistory($email: String!) {
      bookings(where: { userEmail: $email }, orderBy: publishedAt_DESC) {
        id
        date
        time
        bookingStatut
        postponeReason
      
        businessList {
          name
          images {
            url
          }
          address
          contactPerson
        }
      }
    }
  `;
  return executeQuery(query, { email: userEmail });
};

const getBookingHistoryByBusinessEmail = async (email) => {
  const query = gql`
    query GetBookingHistoryByBusinessEmail($email: String!) {
      bookings(
        where: { businessList: { email: $email } }, 
        orderBy: publishedAt_DESC
      ) {
        id
        userName
        userEmail
        date
        time
        bookingStatut
        postponeReason
      }
    }
  `;
  return executeQuery(query, { email });
};

const BusinessBookedSlot = async (businessId, date) => {
  const query = gql`
    query BusinessBookedSlot($businessId: ID!, $date: String!) {
      bookings(where: { 
        businessList: { id: $businessId }, 
        date: $date 
      }) {
        date
        time
      }
    }
  `;
  return executeQuery(query, { businessId, date });
};

const updateBookingStatusAndReason = async (bookingId, status, reason = "") => {
  const mutation = gql`
    mutation UpdateBooking($id: ID!, $status: String!, $reason: String) {
      updateBooking(where: { id: $id }, data: { 
        bookingStatut: $status, 
        postponeReason: $reason 
      }) { id }
      publishBooking(where: { id: $id }) { id }
    }
  `;
  return executeQuery(mutation, { id: bookingId, status, reason });
};

const updateBusinessProfile = async (id, data) => {
  const mutation = gql`
    mutation UpdateBusiness(
      $id: ID!, 
      $about: String, 
      $address: String, 
      $name: String, 
      $contactPerson: String, 
      $phone: Int, 
      $email: String, 
      # Added '!' here to match your schema's required Float type
      $lat: Float!, 
      $lng: Float!
    ) {
      updateBusinessList(
        where: { id: $id }, 
        data: { 
          about: $about, 
          address: $address, 
          name: $name, 
          contactPerson: $contactPerson, 
          phone: $phone, 
          email: $email,
          location: { latitude: $lat, longitude: $lng }
        }
      ) { 
        id 
      }
      publishBusinessList(where: { id: $id }, to: [PUBLISHED]) { 
        id 
      }
    }
  `;
  
  const variables = { 
    id, 
    about: data.about || "",
    address: data.address || "",
    name: data.name || "",
    contactPerson: data.contactPerson || "",
    email: data.email || "",
    phone: data.phone ? parseInt(data.phone) : 0,
    // Ensure these are never null/undefined since the schema requires Float!
    lat: data.lat ? parseFloat(data.lat) : 4.0511, 
    lng: data.lng ? parseFloat(data.lng) : 9.7679
  };

  return executeQuery(mutation, variables);
};

const updateBookingStatus = async (bookingId, status, reason = "") => {
  // 1. Update the status and note
  const updateMutation = gql`
    mutation UpdateBooking($id: ID!, $status: String!, $reason: String) {
      updateBooking(
        where: { id: $id }
        data: { bookingStatut: $status, note: $reason }
      ) {
        id
      }
    }
  `;

  const result = await executeQuery(updateMutation, { id: bookingId, status, reason });

  // 2. IMPORTANT: Publish the update so the UI sees it
  if (result) {
    const publishMutation = gql`
      mutation PublishBooking($id: ID!) {
        publishBooking(where: { id: $id }, to: [PUBLISHED]) {
          id
        }
      }
    `;
    await executeQuery(publishMutation, { id: bookingId });
  }

  return result;
};

const deleteBooking = async (bookingId) => {
  const mutation = gql`
    mutation DeleteBooking($bookingId: ID!) {
      unpublishBooking(where: { id: $bookingId }, from: [PUBLISHED]) { id }
      deleteBooking(where: { id: $bookingId }) { id }
    }
  `;
  return executeQuery(mutation, { bookingId });
};

const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append('fileUpload', file);

  const UPLOAD_URL = process.env.NEXT_PUBLIC_MASTER_URL
    .replace('.cdn.', '.api.')
    .split('/master')[0] + '/upload';

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MASTER_URL_KEY}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Hygraph Error:", errorData);
    throw new Error("Upload rejected by server");
  }

  return await response.json();
};

// --- ADMIN & MANAGEMENT LOGIC ---

const deleteBusiness = async (businessId) => {
  const mutation = gql`
    mutation DeleteBusiness($id: ID!) {
      unpublishBusinessList(where: { id: $id }, from: [PUBLISHED]) { id }
      deleteBusinessList(where: { id: $id }) { id }
    }
  `;
  return executeQuery(mutation, { id: businessId });
};

/**
 * Updated Business Logic
 * Handles text fields and optional relationship updates for Category/Images.
 */
const updateBusiness = async (id, data) => {
  const mutation = gql`
    mutation UpdateBusiness(
      $id: ID!, 
      $name: String!, 
      $address: String!, 
      $contactPerson: String!, 
      $about: String,
      $categoryId: ID,
      $imageId: ID
    ) {
      updateBusinessList(
        where: { id: $id }
        data: { 
          name: $name, 
          address: $address, 
          contactPerson: $contactPerson,
          about: $about,
          # Update Category if ID is provided
          category: { connect: { id: $categoryId } },
          # Update Image if ID is provided
          images: { connect: [{ id: $imageId }] }
        }
      ) { id }
      publishBusinessList(where: { id: $id }, to: [PUBLISHED]) { id }
    }
  `;
  
  const variables = {
    id,
    name: data.name,
    address: data.address,
    contactPerson: data.contactPerson,
    about: data.about || "",
    categoryId: data.categoryId || null,
    imageId: data.imageId || null
  };

  return executeQuery(mutation, variables);
};

const createCategory = async (name, color, iconId) => {
  const mutation = gql`
    mutation CreateCategory($name: String!, $color: String!, $iconId: ID!) {
      createCategory(data: { 
        name: $name, 
        bgcolor: { hex: $color }, 
        icon: { connect: { id: $iconId } } 
      }) { id }
      publishCategory(where: { name: $name }, to: [PUBLISHED]) { id }
    }
  `;
  return executeQuery(mutation, { name, color, iconId });
};

const getAllBookingsAdmin = async () => {
  const query = gql`
    query GetAllBookings {
      bookings(orderBy: publishedAt_DESC) {
        id 
        userName 
        userEmail 
        date 
        time 
        bookingStatut
        createdAt   
        publishedAt  
        businessList { 
          name 
        }
      }
    }
  `;
  return executeQuery(query);
};

const getAdminStats = async () => {
  const query = gql`
    query GetStats {
      businessListsConnection { aggregate { count } }
      bookingsConnection { aggregate { count } }
      categoriesConnection { aggregate { count } }
    }
  `;
  return executeQuery(query);
};

const createNewBusiness = async (data) => {
  // 1. Define the Creation Mutation
  const createMutation = gql`
    mutation CreateBusiness(
      $name: String!, 
      $address: String!, 
      $email: String!, 
      $contactPerson: String!, 
      $phone: Int!, 
      $categoryId: ID!, 
      $imageId: ID! 
    ) {
      createBusinessList(data: {
        name: $name, 
        address: $address, 
        email: $email, 
        contactPerson: $contactPerson,
        phone: $phone,
        category: { connect: { id: $categoryId } },
        images: { connect: [{ id: $imageId }] } 
      }) { 
        id 
        createdAt 
      }
    }
  `;

  // 2. Execute the Create Mutation
  const createResult = await executeQuery(createMutation, {
    ...data,
    phone: parseInt(data.phone) 
  });

  const newId = createResult?.createBusinessList?.id;

  // 3. Automatically Publish if creation was successful
  if (newId) {
    const publishMutation = gql`
      mutation PublishBusiness($id: ID!) {
        publishBusinessList(where: { id: $id }, to: [PUBLISHED]) { 
          id 
          createdAt 
        }
      }
    `;
    await executeQuery(publishMutation, { id: newId });
  }

  return createResult;
};


// --- REVIEWS & RATINGS ---
const createReviews = async (businessId, userName, rating, reviewText) => {
  const mutation = gql`
    mutation CreateReview($businessId: ID!, $userName: String!, $rating: Int!, $reviewText: String!) {
      createReviews(data: {
        userName: $userName,
        rating: $rating,
        reviewText: $reviewText,
        businessList: { connect: { id: $businessId } }
      }) { 
        id 
      }
    }
  `;
  
  const result = await executeQuery(mutation, { businessId, userName, rating, reviewText });
  
  // FIX: Use publishReviews (plural) to match your schema
  if (result?.createReviews?.id) {
    const publishMutation = gql`
      mutation PublishReview($id: ID!) {
        publishReviews(where: { id: $id }, to: [PUBLISHED]) { 
          id 
        }
      }
    `;
    await executeQuery(publishMutation, { id: result.createReviews.id });
  }
  return result;
};

const getBusinessReviews = async (businessId) => {
  const query = gql`
    query GetReviews($businessId: ID!) {
      reviewConnection(
        where: { businessList: { id: $businessId } }, 
        orderBy: createdAt_DESC,
        # Force it to show DRAFT items if publishing is slow
        stage: DRAFT
      ) {
        edges {
          node {
            userName
            rating
            reviewText
            createdAt
          }
        }
      }
    }
  `;
  
  const result = await executeQuery(query, { businessId });
  return result?.reviewConnection?.edges.map(edge => edge.node) || [];
};

// --- INTERVAL BOOKING ---

const createIntervalBooking = async (businessId, startDate, endDate, userEmail, userName) => {
  const mutation = gql`
    mutation CreateBooking($businessId: ID!, $startDate: String!, $endDate: String!, $userEmail: String!, $userName: String!) {
      # Use createBooking (singular) as verified by your test
      createBooking(data: {
        userName: $userName,
        userEmail: $userEmail,
        date: $startDate, 
        time: $endDate, 
        bookingStatut: booked, 
        businessList: { connect: { id: $businessId } }
      }) { 
        id 
      }

      # Publish immediately after creation
      publishManyBookings(where: {bookingStatut: booked}, to: [PUBLISHED]) {
        count
      }
    }
  `;

  // Note: We are mapping 'startDate' to the 'date' field 
  // and 'endDate' to the 'time' field to fit your schema.
  return await executeQuery(mutation, { 
    businessId, 
    startDate, 
    endDate, 
    userEmail, 
    userName 
  });
};

const getBusinessBookings = async (businessId) => {
  const query = gql`
    query GetBusinessBookings {
      bookings(where: {businessList: {id: "`+businessId+`"}}, last: 100) {
        date
        time
      }
    }
  `
  const result = await request(MASTER_URL, query);
  return result;
}

export default {
  getCategory, 
  getAllBusinessList,
  getBusinessById,
  createNewBooking,
  getBusinessByEmail,
  BusinessBookedSlot,
  getBookingHistoryByBusinessEmail, 
  updateBusinessProfile,
  updateBookingStatus,
  createNewBusiness,
  GetUserBookingHistory,
  deleteBooking,
  deleteBusiness,
  createCategory,
  getAdminStats,
  getBusinessByCategory,
  updateBookingStatusAndReason,
  uploadAsset,
  getAllBookingsAdmin,
  updateBusiness,
  createReviews,
  getBusinessReviews,
  createIntervalBooking,
  getBusinessBookings,
};