/**
 * @typedef {Object} KPIs
 * @property {number} totalBookings
 * @property {number} estimatedRevenue
 * @property {number} noShowRate
 * @property {number} voiceBookingRate
 * @property {number} [prevMonthBookings]
 * @property {number} [prevMonthRevenue]
 */

/**
 * @typedef {Object} BookingsPerDay
 * @property {string} date  - "YYYY-MM-DD"
 * @property {number} count
 */

/**
 * @typedef {Object} BookingsPerService
 * @property {string} name
 * @property {number} count
 */

/**
 * @typedef {Object} BookingsPerStaff
 * @property {string} name
 * @property {number} count
 */

/**
 * @typedef {Object} FlaggedCustomer
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {number} noShowCount
 * @property {string|null} lastSeen
 */

/**
 * @typedef {Object} AnalyticsPayload
 * @property {KPIs} kpis
 * @property {{ bookingsPerDay: BookingsPerDay[], bookingsPerService: BookingsPerService[], bookingsPerStaff: BookingsPerStaff[] }} charts
 * @property {FlaggedCustomer[]} flaggedCustomers
 */

export {}