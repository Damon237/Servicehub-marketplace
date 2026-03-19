// 📁 File: /app/_services/GlobalApi.js

import { gql, request } from "graphql-request";

// ✅ FIX: Removed extra spaces in URL (was "content/  ${...}")
const MASTER_URL = `https://eu-west-2.cdn.hygraph.com/content/${process.env.NEXT_PUBLIC_MASTER_URL_KEY}/master`;

// Helper function with comprehensive error handling
const executeQuery = async (query, variables = {}) => {
  try {
    // ✅ Log request for debugging (remove in production if needed)
    console.log("🌐 GraphQL Request:", {
      url: MASTER_URL.substring(0, 50) + "...",
      variables,
      queryName: query.loc?.source?.body?.match(/query\s+(\w+)/)?.[1] || 
                 query.loc?.source?.body?.match(/mutation\s+(\w+)/)?.[1] || "Unknown"
    });

    const result = await request(MASTER_URL, query, variables);
    
    console.log("✅ GraphQL Response:", result);
    return result;
  } catch (error) {
    // ✅ Comprehensive error logging
    console.error("❌ GraphQL Request Error:", {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
      requestErrors: error.response?.errors,
      query: query.loc?.source?.body?.substring(0, 300) + "...",
      variables
    });
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────

const getCategory = async () => {
  const query = gql`
    query Category {
      categories {
        bgcolor {
          hex
        }
        id
        name
        icon {
          url
        }
      }
    }
  `;
  return executeQuery(query);
};

// ─────────────────────────────────────────────────────────────
// BUSINESS LIST
// ─────────────────────────────────────────────────────────────

const getAllBusinessList = async () => {
  const query = gql`
    query BusinessList {
      businessLists {
        about
        address
        category {
          name
        }
        contactPerson
        email
        images {
          url
        }
        id
        name
      }
    }
  `;
  return executeQuery(query);
};

const getBusinessByCategory = async (category) => {
  // ✅ VALIDATION: Category is required
  if (!category || category === "" || category === "undefined" || category === "null") {
    console.error("❌ getBusinessByCategory: Invalid category:", category);
    throw new Error("Category is required and must be a valid string");
  }

  const query = gql`
    query GetBusinessByCategory($category: String!) {
      businessLists(where: { category: { name: $category } }) {
        about
        address
        category {
          name
        }
        contactPerson
        email
        id
        name
        images {
          url
        }
      }
    }
  `;
  
  console.log("🎯 getBusinessByCategory - Fetching for:", category);
  return executeQuery(query, { category });
};

const getBusinessById = async (id) => {
  // ✅ VALIDATION: ID is required
  if (!id || id === "" || id === "undefined" || id === "null") {
    console.error("❌ getBusinessById: Invalid ID:", id);
    throw new Error("Business ID is required and must be a valid string");
  }

  const query = gql`
    query GetBusinessById($id: ID!) {
      businessList(where: { id: $id }) {
        about
        address
        category {
          name
        }
        contactPerson
        email
        id
        name
        images {
          url
        }
      }
    }
  `;
  
  console.log("🎯 getBusinessById - Fetching:", id);
  return executeQuery(query, { id });
};

// ─────────────────────────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────────────────────────

const createNewBooking = async (businessId, date, time, userEmail, userName) => {

  const createMutation = gql`
    mutation CreateBooking(
      $businessId: ID!
      $date: String!
      $time: String!
      $userEmail: String!
      $userName: String!
    ) {
      createBooking(
        data: {
          bookingStatut: booked
          businessList: {
            connect: { id: $businessId }
          }
          date: $date
          time: $time
          userEmail: $userEmail
          userName: $userName
        }
      ) {
        id
      }
    }
  `;

  const result = await executeQuery(createMutation, {
    businessId,
    date,
    time,
    userEmail,
    userName
  });

  const bookingId = result.createBooking.id;

  const publishMutation = gql`
    mutation PublishBooking($id: ID!) {
      publishBooking(where: { id: $id }) {
        id
      }
    }
  `;

  await executeQuery(publishMutation, { id: bookingId });

  return bookingId;
};

const BusinessBookedSlot = async (businessId, date) => {
  // ✅ VALIDATION: Both fields are required
  if (!businessId || businessId === "" || businessId === "undefined") {
    console.error("❌ BusinessBookedSlot: Invalid businessId:", businessId);
    throw new Error("Business ID is required");
  }

  if (!date || date === "" || date === "undefined") {
    console.error("❌ BusinessBookedSlot: Invalid date:", date);
    throw new Error("Date is required");
  }

  const query = gql`
    query BusinessBookedSlot($businessId: ID!, $date: String!) {
      bookings(
        where: {
          businessList_some: {
            id: $businessId
          }
          date: $date
        }
      ) {
        date
        time
      }
    }
  `;

  console.log("🎯 BusinessBookedSlot - Fetching for:", { businessId, date });
  return executeQuery(query, { businessId, date });
};

const GetUserBookingHistory = async (userEmail) => {
  // ✅ VALIDATION: Email is required
  if (!userEmail || userEmail === "" || userEmail === "undefined") {
    console.error("❌ GetUserBookingHistory: Invalid userEmail:", userEmail);
    throw new Error("User email is required");
  }

  const query = gql`
    query GetUserBookingHistory($userEmail: String!) {
      bookings(
        where: {
          userEmail: $userEmail
        }
        orderBy: publishedAt_DESC
      ) {
        businessList {
          name
          images {
            url
          }
          contactPerson
          address
        }
        date
        time
        id
      }
    }
  `;

  console.log("🎯 GetUserBookingHistory - Fetching for:", userEmail);
  return executeQuery(query, { userEmail });
};

const deleteBooking = async (bookingId) => {
  if (!bookingId || typeof bookingId !== 'string') {
    throw new Error("Invalid Booking ID");
  }

  const mutation = gql`
    mutation DeleteBooking($bookingId: ID!) {
      unpublishBooking(where: { id: $bookingId }, from: [PUBLISHED]) {
        id
      }
      deleteBooking(where: { id: $bookingId }) {
        id
      }
    }
  `;

  const variables = {
    bookingId: bookingId,
  };

  return executeQuery(mutation, variables);
};

//   console.log("🎯 deleteBooking - Deleting:", bookingId);
//   return executeQuery(mutation, { bookingId });
// };

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

export default {
  getCategory,
  getAllBusinessList,
  getBusinessByCategory,
  getBusinessById,
  createNewBooking,
  BusinessBookedSlot,
  GetUserBookingHistory,
  deleteBooking
};