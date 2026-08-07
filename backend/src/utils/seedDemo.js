import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import EventRequest from "../models/EventRequest.js";
import Quotation from "../models/Quotation.js";
import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Expense from "../models/Expense.js";
import Attendee from "../models/Attendee.js";
import Supplier from "../models/Supplier.js";

const addDays = (n) => new Date(Date.now() + n * 86400000);
const createSequentially = async (Model, items) => {
  const results = [];

  for (const item of items) {
    const document = await Model.create(item);
    results.push(document);
  }

  return results;
};
await connectDB();

const admin = await User.findOne({
  email: process.env.ADMIN_EMAIL || "admin@eventflow.local",
});

if (!admin) {
  console.error("Admin not found. Run npm run seed:admin first.");
  process.exit(1);
}

await Promise.all([
  Customer.deleteMany({}),
  EventRequest.deleteMany({}),
  Quotation.deleteMany({}),
  Event.deleteMany({}),
  Task.deleteMany({}),
  Expense.deleteMany({}),
  Attendee.deleteMany({}),
  Supplier.deleteMany({}),
]);

// =========================
// CUSTOMERS
// =========================

const customerData = [
  {
    name: "NovaTech",
    companyName: "NovaTech Vietnam",
    email: "marketing@novatech.vn",
    phone: "0909000111",
    address: "District 1, Ho Chi Minh City",
    taxCode: "0319988111",
    source: "REFERRAL",
    contactPerson: {
      name: "Nguyen Minh Anh",
      position: "Marketing Director",
      phone: "0909111222",
      email: "minhanh@novatech.vn",
    },
    createdBy: admin._id,
  },

  {
    name: "GreenBank",
    companyName: "GreenBank JSC",
    email: "events@greenbank.vn",
    phone: "02838220099",
    address: "Thu Duc City, Ho Chi Minh City",
    source: "EMAIL",
    contactPerson: {
      name: "Tran Quoc Bao",
      position: "Brand Manager",
      phone: "0918222333",
      email: "bao@greenbank.vn",
    },
    createdBy: admin._id,
  },

  {
    name: "VietRetail",
    companyName: "VietRetail Group",
    email: "brand@vietretail.vn",
    phone: "0283999888",
    address: "District 7, Ho Chi Minh City",
    source: "WEBSITE",
    contactPerson: {
      name: "Le Phuong Thao",
      position: "Event Lead",
      phone: "0933444555",
      email: "thao@vietretail.vn",
    },
    createdBy: admin._id,
  },

  {
    name: "SkyWorks",
    companyName: "SkyWorks Software",
    email: "people@skyworks.vn",
    phone: "0243777555",
    address: "Cau Giay, Hanoi",
    source: "FACEBOOK",
    contactPerson: {
      name: "Pham Hoang Nam",
      position: "People Experience Manager",
      phone: "0977666555",
      email: "nam@skyworks.vn",
    },
    createdBy: admin._id,
  },
];

const customers = [];

for (const data of customerData) {
  const customer = await Customer.create(data);
  customers.push(customer);
}
// =========================
// EVENT REQUESTS
// =========================

const req1 = await EventRequest.create({
  customer: customers[0]._id,
  title: "NovaTech Annual Summit 2026",
  eventType: "CONFERENCE",
  eventDate: addDays(24),
  expectedAttendees: 650,
  location: "Thiskyhall Sala, HCMC",
  expectedBudget: 1250000000,
  requirements: ["Main stage", "LED", "Livestream", "Catering"],
  status: "APPROVED",
  priority: "HIGH",
  owner: admin._id,
  createdBy: admin._id,
});

const req2 = await EventRequest.create({
  customer: customers[1]._id,
  title: "GreenBank Leadership Gala",
  eventType: "GALA",
  eventDate: addDays(42),
  expectedAttendees: 420,
  location: "InterContinental Saigon",
  expectedBudget: 880000000,
  requirements: ["Gala dinner", "Entertainment", "Branding"],
  status: "NEGOTIATING",
  priority: "MEDIUM",
  owner: admin._id,
  createdBy: admin._id,
});

const req3 = await EventRequest.create({
  customer: customers[2]._id,
  title: "VietRetail Product Launch Q4",
  eventType: "ACTIVATION",
  eventDate: addDays(15),
  expectedAttendees: 280,
  location: "Gem Center",
  expectedBudget: 620000000,
  requirements: ["Product stage", "KOL", "Media"],
  status: "QUOTATION",
  priority: "URGENT",
  owner: admin._id,
  createdBy: admin._id,
});

await EventRequest.create({
  customer: customers[3]._id,
  title: "SkyWorks Year End Party",
  eventType: "CORPORATE",
  eventDate: addDays(78),
  expectedAttendees: 900,
  location: "Hanoi - venue TBD",
  expectedBudget: 1450000000,
  requirements: ["Theme concept", "Stage", "Entertainment"],
  status: "QUALIFYING",
  priority: "MEDIUM",
  owner: admin._id,
  createdBy: admin._id,
});

// =========================
// QUOTATIONS
// =========================

const q1 = await Quotation.create({
  eventRequest: req1._id,
  customer: customers[0]._id,
  title: "NovaTech Summit - Full Production",
  items: [
    {
      name: "Venue & production",
      quantity: 1,
      unitPrice: 450000000,
    },
    {
      name: "LED, AV & lighting",
      quantity: 1,
      unitPrice: 280000000,
    },
    {
      name: "Content & media",
      quantity: 1,
      unitPrice: 120000000,
    },
    {
      name: "Catering",
      quantity: 650,
      unitPrice: 420000,
    },
  ],
  discount: 25000000,
  vatPercent: 10,
  status: "APPROVED",
  validUntil: addDays(10),
  createdBy: admin._id,
});

await Quotation.create({
  eventRequest: req2._id,
  customer: customers[1]._id,
  title: "GreenBank Leadership Gala",
  items: [
    {
      name: "Gala production",
      quantity: 1,
      unitPrice: 330000000,
    },
    {
      name: "Dinner package",
      quantity: 420,
      unitPrice: 650000,
    },
    {
      name: "Entertainment",
      quantity: 1,
      unitPrice: 95000000,
    },
  ],
  vatPercent: 10,
  status: "SENT",
  validUntil: addDays(7),
  createdBy: admin._id,
});

await Quotation.create({
  eventRequest: req3._id,
  customer: customers[2]._id,
  title: "VietRetail Launch Proposal",
  items: [
    {
      name: "Launch stage & AV",
      quantity: 1,
      unitPrice: 250000000,
    },
    {
      name: "Media package",
      quantity: 1,
      unitPrice: 120000000,
    },
    {
      name: "KOL & activation",
      quantity: 1,
      unitPrice: 155000000,
    },
  ],
  vatPercent: 10,
  status: "DRAFT",
  validUntil: addDays(12),
  createdBy: admin._id,
});

// =========================
// EVENTS
// =========================

const event1 = await Event.create({
  customer: customers[0]._id,
  eventRequest: req1._id,
  quotation: q1._id,

  name: req1.title,
  type: req1.eventType,

  startDate: req1.eventDate,
  endDate: req1.eventDate,

  venue: req1.location,

  attendeesExpected: req1.expectedAttendees,

  status: "CONFIRMED",
  health: "ON_TRACK",

  progress: 68,

  budget: {
    planned: 980000000,
    committed: 720000000,
    actual: 540000000,
    revenue: q1.total,
  },

  manager: admin._id,
  createdBy: admin._id,
});

req1.status = "CONVERTED";
await req1.save();

const event2 = await Event.create({
  customer: customers[2]._id,
  eventRequest: req3._id,

  name: "VietRetail Pop-up Activation",
  type: "ACTIVATION",

  startDate: addDays(8),
  endDate: addDays(10),

  venue: "Nguyen Hue Walking Street",

  attendeesExpected: 1200,

  status: "PLANNING",
  health: "AT_RISK",

  progress: 43,

  budget: {
    planned: 510000000,
    committed: 360000000,
    actual: 210000000,
    revenue: 640000000,
  },

  manager: admin._id,
  createdBy: admin._id,
});

const event3 = await Event.create({
  customer: customers[3]._id,

  name: "SkyWorks Tech Townhall",
  type: "CORPORATE",

  startDate: addDays(5),

  venue: "National Convention Center, Hanoi",

  attendeesExpected: 520,

  status: "CONFIRMED",
  health: "ON_TRACK",

  progress: 82,

  budget: {
    planned: 420000000,
    committed: 390000000,
    actual: 345000000,
    revenue: 560000000,
  },

  manager: admin._id,
  createdBy: admin._id,
});

// =========================
// TASKS
// =========================

await createSequentially(Task, [
  {
    event: event1._id,
    title: "Finalize main stage 3D design",
    status: "REVIEW",
    priority: "HIGH",
    dueDate: addDays(2),
    assignedTo: "Linh Nguyen",
    department: "Creative",
    createdBy: admin._id,
  },

  {
    event: event1._id,
    title: "Confirm keynote speaker travel",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: addDays(4),
    assignedTo: "Tuan Pham",
    department: "Guest Relations",
    createdBy: admin._id,
  },

  {
    event: event1._id,
    title: "Approve LED content playlist",
    status: "TODO",
    priority: "HIGH",
    dueDate: addDays(6),
    assignedTo: "Mai Tran",
    department: "Media",
    createdBy: admin._id,
  },

  {
    event: event1._id,
    title: "Venue technical rehearsal plan",
    status: "DONE",
    priority: "MEDIUM",
    dueDate: addDays(-1),
    assignedTo: "Huy Le",
    department: "Production",
    createdBy: admin._id,
  },

  {
    event: event2._id,
    title: "Obtain public space activation permit",
    status: "BLOCKED",
    priority: "URGENT",
    dueDate: addDays(-2),
    assignedTo: "An Vo",
    department: "Operations",
    createdBy: admin._id,
  },

  {
    event: event2._id,
    title: "Finalize KOL appearance schedule",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: addDays(1),
    assignedTo: "Thao Nguyen",
    department: "Talent",
    createdBy: admin._id,
  },

  {
    event: event3._id,
    title: "Lock final attendee seating plan",
    status: "REVIEW",
    priority: "MEDIUM",
    dueDate: addDays(1),
    assignedTo: "Bao Tran",
    department: "Guest Ops",
    createdBy: admin._id,
  },

  {
    event: event3._id,
    title: "Run full AV rehearsal",
    status: "TODO",
    priority: "HIGH",
    dueDate: addDays(3),
    assignedTo: "Huy Le",
    department: "Production",
    createdBy: admin._id,
  },
]);

// =========================
// EXPENSES
// =========================

await createSequentially(Expense, [
  {
    event: event1._id,
    category: "PRODUCTION",
    description: "Stage fabrication deposit",
    vendor: "StagePro",
    amount: 220000000,
    status: "APPROVED",
    createdBy: admin._id,
  },

  {
    event: event1._id,
    category: "CATERING",
    description: "Catering first deposit",
    vendor: "Gourmet Events",
    amount: 180000000,
    status: "PAID",
    createdBy: admin._id,
  },

  {
    event: event1._id,
    category: "MEDIA",
    description: "Livestream production",
    vendor: "FrameLab",
    amount: 78000000,
    status: "PENDING",
    createdBy: admin._id,
  },

  {
    event: event2._id,
    category: "PRODUCTION",
    description: "Pop-up structure fabrication",
    vendor: "Activation Works",
    amount: 155000000,
    status: "APPROVED",
    createdBy: admin._id,
  },

  {
    event: event3._id,
    category: "VENUE",
    description: "Convention hall rental",
    vendor: "NCC Hanoi",
    amount: 145000000,
    status: "PAID",
    createdBy: admin._id,
  },
]);

// =========================
// ATTENDEES
// =========================

for (const [event, count, checked] of [
  [event1, 24, 15],
  [event2, 10, 0],
  [event3, 18, 8],
]) {
  for (let i = 1; i <= count; i++) {
    await Attendee.create({
      event: event._id,

      name: `Demo Guest ${event.eventCode}-${i}`,

      email: `guest${event.eventCode}${i}@example.com`,

      company: i % 2 ? "Partner Company" : "Customer Team",

      ticketType: i % 7 === 0 ? "VIP" : "GENERAL",

      status: i <= checked ? "CHECKED_IN" : "REGISTERED",

      checkInAt: i <= checked ? new Date() : undefined,

      createdBy: admin._id,
    });
  }
}

// =========================
// SUPPLIERS
// =========================

await createSequentially(Supplier, [
  {
    name: "StagePro Vietnam",
    category: "PRODUCTION",

    contactName: "Duc Nguyen",

    phone: "0903123456",

    email: "hello@stagepro.vn",

    rating: 4.8,

    createdBy: admin._id,
  },

  {
    name: "Lumina Lighting",
    category: "LIGHTING",

    contactName: "Khanh Le",

    phone: "0912456789",

    email: "sales@lumina.vn",

    rating: 4.6,

    createdBy: admin._id,
  },

  {
    name: "Gourmet Events",
    category: "CATERING",

    contactName: "My Pham",

    phone: "0933555777",

    email: "event@gourmet.vn",

    rating: 4.7,

    createdBy: admin._id,
  },

  {
    name: "FrameLab Media",
    category: "MEDIA",

    contactName: "Long Tran",

    phone: "0988777666",

    email: "booking@framelab.vn",

    rating: 4.5,

    createdBy: admin._id,
  },

  {
    name: "MoveFast Logistics",
    category: "TRANSPORT",

    contactName: "Son Vo",

    phone: "0966123123",

    email: "ops@movefast.vn",

    rating: 4.3,

    createdBy: admin._id,
  },
]);

console.log("Enterprise demo data seeded successfully.");

process.exit(0);
