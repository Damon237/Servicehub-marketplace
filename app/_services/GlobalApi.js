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
  const query = gql`
    query Category {
      categories {
        bgcolor { hex }
        id
        name
        icon { url }
      }
    }
  `;
  return executeQuery(query);
};

// ─────────────────────────────────────────────────────────────
// BUSINESS LIST QUERIES (Updated with Nested Location Object)
// ─────────────────────────────────────────────────────────────

const getAllBusinessList = async () => {
  const query = gql`
    query BusinessList {
      businessLists {
        about
        address
        category { name }
        contactPerson
        email
        images { url }
        id
        name
        location {
          latitude
          longitude
        }
      }
    }
  `;
  return executeQuery(query);
};

const getBusinessByCategory = async (category) => {
  if (!category) throw new Error("Category is required");

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
  if (!id) throw new Error("Business ID is required");

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

// ─────────────────────────────────────────────────────────────
// BOOKING & HISTORY
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
          businessList: { connect: { id: $businessId } }
          date: $date
          time: $time
          userEmail: $userEmail
          userName: $userName
        }
      ) { id }
    }
  `;

  const result = await executeQuery(createMutation, { businessId, date, time, userEmail, userName });
  const bookingId = result.createBooking.id;

  const publishMutation = gql`
    mutation PublishBooking($id: ID!) {
      publishBooking(where: { id: $id }) { id }
    }
  `;
  await executeQuery(publishMutation, { id: bookingId });
  return result;
};

const BusinessBookedSlot = async (businessId, date) => {
  const query = gql`
    query BusinessBookedSlot($businessId: ID!, $date: String!) {
      bookings(where: { businessList_some: { id: $businessId }, date: $date }) {
        date
        time
      }
    }
  `;
  return executeQuery(query, { businessId, date });
};

const GetUserBookingHistory = async (userEmail) => {
  const query = gql`
    query GetUserBookingHistory($userEmail: String!) {
      bookings(where: { userEmail: $userEmail }, orderBy: publishedAt_DESC) {
        businessList {
          name
          images { url }
          contactPerson
          address
        }
        date
        time
        id
      }
    }
  `;
  return executeQuery(query, { userEmail });
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