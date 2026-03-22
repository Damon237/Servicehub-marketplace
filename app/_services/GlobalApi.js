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
      businessLists {
        about address category { name } contactPerson email images { url } id name
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
        about address category { name } contactPerson email id name images { url }
      }
    }
  `;
  return executeQuery(query, { id });
};

// --- BOOKING LOGIC ---
// In GlobalApi.js
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
        # Look for bookings where the linked business has this email
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
    mutation UpdateBusiness($id: ID!, $about: String, $address: String, $name: String) {
      updateBusinessList(where: { id: $id }, data: { about: $about, address: $address, name: $name }) { id }
      publishBusinessList(where: { id: $id }) { id }
    }
  `;
  return executeQuery(mutation, { id, ...data });
};

const updateBookingStatus = async (bookingId, status, reason = "") => {
  const mutation = gql`
    mutation UpdateBookingStatus($id: ID!, $status: String!, $reason: String) {
      updateBooking(where: { id: $id }, data: { 
        bookingStatut: $status, 
        postponeReason: $reason 
      }) { id }
      publishBooking(where: { id: $id }) { id }
    }
  `;
  return executeQuery(mutation, { id: bookingId, status, reason });
};

const deleteBooking = async (bookingId) => {
  const mutation = gql`
    mutation DeleteBooking($bookingId: ID!) {
      # Step 1: Remove from the Published stage
      unpublishBooking(where: { id: $bookingId }, from: [PUBLISHED]) { id }
      
      # Step 2: Delete the actual record
      deleteBooking(where: { id: $bookingId }) { id }
    }
  `;
  return executeQuery(mutation, { bookingId });
};

// NEW: PROVIDER REGISTRATION
const uploadAsset = async (file) => {
  // 1. Create FormData
  const formData = new FormData();
  formData.append('fileUpload', file);

  // 2. Construct the URL carefully
  // Ensure there are no double slashes or missing slashes
  const UPLOAD_URL = MASTER_URL
    .replace('.cdn.', '.api.')
    .split('/master')[0] + '/upload';

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData, // The browser WILL handle the Content-Type and Boundary automatically
      headers: {
        // ONLY include the Authorization token
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MASTER_URL_KEY}`,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Hygraph Upload Rejected:", errorResponse);
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Fetch Execution Error:", err);
    throw err;
  }
};
// app/_services/GlobalApi.js

const createNewBusiness = async (data) => {
  const mutation = gql`
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
        images: { connect: { id: $imageId } } 
      }) {
        id
      }
      
      
      publishBusinessList(where: { email: $email }, to: [PUBLISHED]) {
        id
      }
    }
  `;
  return executeQuery(mutation, data);
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
  getBusinessByCategory,
  updateBookingStatusAndReason,
  uploadAsset,
};