import { gql } from '@apollo/client/core'

export const GET_PROCUREMENT_REQUESTS = gql`
  query GetProcurementRequests {
    procurementRequests {
      id
      title
      department
      priority
      status
      neededByDate
      items {
        id
        itemName
        quantity
        partNumber
        estimatedUnitCost
      }
      requestedBy {
        id
        name
        role
      }
      approvedBy {
        id
        name
        role
      }
      approvedAt
      rejectionReason
      createdAt
    }
  }
`

export const CREATE_PROCUREMENT_REQUEST = gql`
  mutation CreateProcurementRequest($input: CreateProcurementRequestInput!) {
    createProcurementRequest(input: $input) {
      id
      title
      department
      priority
      status
      neededByDate
      requestedBy {
        id
        name
      }
      createdAt
    }
  }
`

export const CREATE_REQUEST_ITEM = gql`
  mutation CreateRequestItem($input: CreateRequestItemInput!) {
    createRequestItem(input: $input) {
      id
      itemName
      quantity
      partNumber
      estimatedUnitCost
    }
  }
`

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders {
    purchaseOrders {
      id
      poNumber
      status
      orderDate
      expectedDeliveryDate
      subtotal
      notes
      procurementRequest {
        id
        title
      }
      vendor {
        id
        name
      }
      items {
        id
        itemName
        quantity
        unitOfMeasure
        unitCost
        lineTotal
        partNumber
        manufacturer
        quantityReceived
        quantityRemaining
        isFullyReceived
      }
      receipts {
        id
        quantityReceived
        receivedDate
        receivedBy
        notes
      }
      createdAt
    }
  }
`

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      poNumber
    }
  }
`

export const UPDATE_PO_STATUS = gql`
  mutation UpdatePurchaseOrderStatus($input: UpdatePurchaseOrderStatusInput!) {
    updatePurchaseOrderStatus(input: $input) {
      id
      status
    }
  }
`

export const APPROVE_PURCHASE_ORDER = gql`
  mutation ApprovePurchaseOrder($id: ID!, $approverId: ID!) {
    approvePurchaseOrder(id: $id, approverId: $approverId) {
      id
      status
      approvedBy {
        id
        name
      }
      approvedAt
      denialReason
    }
  }
`

export const DENY_PURCHASE_ORDER = gql`
  mutation DenyPurchaseOrder($id: ID!, $approverId: ID!, $reason: String!) {
    denyPurchaseOrder(id: $id, approverId: $approverId, reason: $reason) {
      id
      status
      approvedBy {
        id
        name
      }
      approvedAt
      denialReason
    }
  }
`

export const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      name
      vendorType
      qualificationStatus
      isPreferred
      contactName
      email
      phone
      website
      industries
      specialties
      createdAt
    }
  }
`

export const CREATE_VENDOR = gql`
  mutation CreateVendor($input: CreateVendorInput!) {
    createVendor(input: $input) {
      id
      name
      vendorType
    }
  }
`

export const RECEIVE_PO_ITEM = gql`
  mutation ReceivePurchaseOrderItem($input: ReceivePurchaseOrderItemInput!) {
    receivePurchaseOrderItem(input: $input) {
      id
      status
    }
  }
`

export const GET_ACTIVE_USERS = gql`
  query GetActiveUsers {
    activeUsers {
      id
      name
      email
      role
      department
      isActive
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      department
      isActive
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
    }
  }
`

export const REVIEW_PROCUREMENT_REQUEST = gql`
  mutation ReviewProcurementRequest($input: ReviewProcurementRequestInput!) {
    reviewProcurementRequest(input: $input) {
      id
      status
      approvedBy {
        id
        name
      }
      approvedAt
      rejectionReason
    }
  }
`
