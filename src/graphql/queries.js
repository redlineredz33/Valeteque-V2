/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTicket = /* GraphQL */ `
  query GetTicket($id: ID!) {
    getTicket(id: $id) {
      id
      make
      model
      processed
      createdAt
      updatedAt
    }
  }
`;
export const listTickets = /* GraphQL */ `
  query ListTickets(
    $filter: ModelTicketFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTickets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        make
        model
        processed
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const searchTickets = /* GraphQL */ `
  query SearchTickets(
    $filter: SearchableTicketFilterInput
    $sort: SearchableTicketSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchTickets(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        make
        model
        processed
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
