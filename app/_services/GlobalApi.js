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
    mutation CreateBooking(
      $businessId: ID!, 
      $date: String!, 
      $time: String!, 
      $userEmail: String!, 
      $userName: String!
    ) {
      # 1. Create the booking with the connected business relationship
      createBooking(data: {
        bookingStatut: booked, # Ensure 'booked' is a valid value in your Hygraph Enum
        businessList: { connect: { id: $businessId } }, 
        date: $date, 
        time: $time, 
        userEmail: $userEmail, 
        userName: $userName
      }) { 
        id 
      }
      
      # 2. Immediately publish the new booking so it appears in the 'Upcoming' tab
      publishManyBookings(to: [PUBLISHED]) {
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
      }
    }
  `;
  return executeQuery(query, { email });
};

const BusinessBookedSlot = async (businessId) => {
  const query = gql`
    query BusinessBookedSlot($businessId: ID!) {
      bookings(where: { 
        businessList: { id: $businessId }
      }) {
        date
        time
      }
    }
  `;
  
  // CRITICAL: This object must match the name in the query above ($businessId)
  const variables = { 
    businessId: businessId 
  }; 

  return executeQuery(query, variables);
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
    lat: data.lat ? parseFloat(data.lat) : 4.0511, 
    lng: data.lng ? parseFloat(data.lng) : 9.7679
  };

  return executeQuery(mutation, variables);
};

// @/app/_services/GlobalApi.js

// 1. Fix the update function
const updateBookingStatus = async (bookingId, status) => {
  const updateMutation = gql`
    mutation UpdateBooking($id: ID!, $status: ProgressStatut!) {
      updateBooking(
        where: { id: $id }
        data: { bookingStatut: $status }
      ) {
        id
      }
    }
  `;

  try {
    const result = await executeQuery(updateMutation, { 
      id: bookingId, 
      status: status // This will be 'completed'
    });

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
  } catch (error) {
    console.error("❌ Status Update Failed:", error);
    throw error;
  }
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

const deleteBusiness = async (businessId) => {
  const mutation = gql`
    mutation DeleteBusiness($id: ID!) {
      unpublishBusinessList(where: { id: $id }, from: [PUBLISHED]) { id }
      deleteBusinessList(where: { id: $id }) { id }
    }
  `;
  return executeQuery(mutation, { id: businessId });
};

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
          category: { connect: { id: $categoryId } },
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

  const createResult = await executeQuery(createMutation, {
    ...data,
    phone: parseInt(data.phone) 
  });

  const newId = createResult?.createBusinessList?.id;

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

const createIntervalBooking = async (businessId, startDate, endDate, userEmail, userName) => {
  const mutation = gql`
    mutation CreateBooking($businessId: ID!, $startDate: String!, $endDate: String!, $userEmail: String!, $userName: String!) {
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

      publishManyBookings(where: {bookingStatut: booked}, to: [PUBLISHED]) {
        count
      }

      # FIX: Publishes the Business to remove the "?" status in UI
      publishBusinessList(where: { id: $businessId }, to: [PUBLISHED]) {
        id
      }
    }
  `;

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


const getMessagesByBookingId = async (bookingId) => {
  const query = `query GetMessages($bookingId: ID!) {
    messages(where: {booking: {id: $bookingId}}, orderBy: createdAt_ASC) {
      content
      senderEmail
      userName
      createdAt
    }
  }`;
  const variables = { bookingId };
  return await request(MASTER_URL, query, variables);
};

const createNewMessage = async (bookingId, senderEmail, content, userName) => {
  const mutation = `mutation CreateMessage($bookingId: ID!, $senderEmail: String!, $content: String!, $userName: String!) {
    createMessage(
      data: {
        content: $content, 
        senderEmail: $senderEmail, 
        userName: $userName,
        booking: {connect: {id: $bookingId}}
      }
    ) {
      id
    }
    publishManyMessages(to: PUBLISHED) {
      count
    }
  }`;
  const variables = { bookingId, senderEmail, content, userName };
  return await request(MASTER_URL, mutation, variables);
};

const createNotification = async (data) => {
  try {
    const response = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("❌ Notification Error:", error);
    throw error;
  }
};

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
  getMessagesByBookingId,
  createNewMessage,
  createNotification
};