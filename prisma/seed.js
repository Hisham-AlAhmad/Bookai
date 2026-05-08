const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function makeDate(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

async function createBooking({
    businessId,
    customer,
    staff,
    service,
    date,
    time,
    status,
    source,
    note,
    cancelledBy,
    cancellationReason,
}) {
    const startsAt = makeDate(date, time);
    const endsAt = addMinutes(startsAt, service.duration_mins);

    return prisma.booking.create({
        data: {
            business_id: businessId,
            customer_id: customer.id,
            staff_id: staff.id,
            service_id: service.id,
            starts_at: startsAt,
            ends_at: endsAt,
            status,
            booked_via: source,
            customer_note: note || null,
            cancelled_by: cancelledBy || null,
            cancellation_reason: cancellationReason || null,
        },
    });
}

async function main() {
    console.log("Seeding database...");
    const passwordHash = await bcrypt.hash("password123", 10);

    // Reset seed tables for deterministic data in dev.
    await prisma.booking.deleteMany();
    await prisma.staffService.deleteMany();
    await prisma.workingHours.deleteMany();
    await prisma.service.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.business.deleteMany();
    console.log("Cleared existing data.");

    const tonyBusiness = await prisma.business.create({
        data: {
            slug: "tony-barber",
            name: "Tony Barber",
            category: "barbershop",
            phone: "555-2000",
            city: "Riyadh",
            address: "King St 12",
            bio: "Classic cuts and clean fades.",
        },
    });
    console.log("Created business: Tony Barber");

    const tonyOwner = await prisma.staff.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Tony Owner",
            can_login: true,
            email: "owner@tony.com",
            password_hash: passwordHash,
            role: "owner",
            phone: "555-2001",
        },
    });

    const tonyStaff = await prisma.staff.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Tony Staff",
            can_login: true,
            email: "staff@tony.com",
            password_hash: passwordHash,
            role: "staff",
            phone: "555-2002",
        },
    });

    const tonyAssistant = await prisma.staff.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Tony Assistant",
            can_login: false,
            role: "staff",
            phone: "555-2003",
        },
    });

    const tonyServices = {};
    tonyServices.haircut = await prisma.service.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Haircut",
            duration_mins: 30,
            price_usd: new Prisma.Decimal("15.00"),
        },
    });
    tonyServices.beardTrim = await prisma.service.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Beard Trim",
            duration_mins: 20,
            price_usd: new Prisma.Decimal("10.00"),
        },
    });
    tonyServices.haircutBeard = await prisma.service.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Haircut + Beard",
            duration_mins: 45,
            price_usd: new Prisma.Decimal("22.00"),
        },
    });
    tonyServices.kidsCut = await prisma.service.create({
        data: {
            business_id: tonyBusiness.id,
            name: "Kid's Cut",
            duration_mins: 20,
            price_usd: new Prisma.Decimal("12.00"),
        },
    });

    const tonyStaffMembers = [tonyOwner, tonyStaff, tonyAssistant];
    const tonyServiceList = Object.values(tonyServices);
    await prisma.staffService.createMany({
        data: tonyStaffMembers.flatMap((member) =>
            tonyServiceList.map((service) => ({
                staff_id: member.id,
                service_id: service.id,
            }))
        ),
    });

    await prisma.workingHours.createMany({
        data: [
            { business_id: tonyBusiness.id, day_of_week: 0, open_at: "00:00", close_at: "00:00", is_closed: true },
            { business_id: tonyBusiness.id, day_of_week: 1, open_at: "09:00", close_at: "19:00", is_closed: false },
            { business_id: tonyBusiness.id, day_of_week: 2, open_at: "09:00", close_at: "19:00", is_closed: false },
            { business_id: tonyBusiness.id, day_of_week: 3, open_at: "09:00", close_at: "19:00", is_closed: false },
            { business_id: tonyBusiness.id, day_of_week: 4, open_at: "09:00", close_at: "19:00", is_closed: false },
            { business_id: tonyBusiness.id, day_of_week: 5, open_at: "09:00", close_at: "19:00", is_closed: false },
            { business_id: tonyBusiness.id, day_of_week: 6, open_at: "09:00", close_at: "19:00", is_closed: false },
        ],
    });

    const tonyCustomers = [];
    tonyCustomers.push(
        await prisma.customer.create({
            data: { name: "Ahmed Ali", phone: "555-0001", preferred_language: "en" },
        })
    );
    tonyCustomers.push(
        await prisma.customer.create({
            data: { name: "Sara Yasin", phone: "555-0002", preferred_language: "ar" },
        })
    );
    tonyCustomers.push(
        await prisma.customer.create({
            data: { name: "Omar Khaled", phone: "555-0003", preferred_language: "en" },
        })
    );

    const tonyBookings = [
        {
            customer: tonyCustomers[0],
            staff: tonyOwner,
            service: tonyServices.haircut,
            date: "2026-05-06",
            time: "09:00",
            status: "confirmed",
            source: "form",
            note: "Skin fade.",
        },
        {
            customer: tonyCustomers[1],
            staff: tonyStaff,
            service: tonyServices.beardTrim,
            date: "2026-05-06",
            time: "10:00",
            status: "pending",
            source: "form",
            note: "Short beard.",
        },
        {
            customer: tonyCustomers[2],
            staff: tonyAssistant,
            service: tonyServices.kidsCut,
            date: "2026-05-06",
            time: "11:00",
            status: "cancelled",
            source: "voice",
            cancelledBy: "customer",
            cancellationReason: "Plans changed.",
        },
        {
            customer: tonyCustomers[0],
            staff: tonyOwner,
            service: tonyServices.haircutBeard,
            date: "2026-05-07",
            time: "13:00",
            status: "confirmed",
            source: "voice",
        },
        {
            customer: tonyCustomers[1],
            staff: tonyStaff,
            service: tonyServices.haircut,
            date: "2026-05-07",
            time: "14:00",
            status: "no_show",
            source: "form",
        },
        {
            customer: tonyCustomers[2],
            staff: tonyAssistant,
            service: tonyServices.beardTrim,
            date: "2026-05-08",
            time: "15:30",
            status: "confirmed",
            source: "form",
        },
        {
            customer: tonyCustomers[0],
            staff: tonyStaff,
            service: tonyServices.kidsCut,
            date: "2026-05-08",
            time: "16:30",
            status: "pending",
            source: "form",
        },
        {
            customer: tonyCustomers[1],
            staff: tonyOwner,
            service: tonyServices.haircutBeard,
            date: "2026-05-09",
            time: "12:00",
            status: "confirmed",
            source: "form",
        },
    ];

    for (const booking of tonyBookings) {
        await createBooking({
            businessId: tonyBusiness.id,
            ...booking,
        });
    }
    console.log(
        `Tony Barber seeded: staff=${tonyStaffMembers.length}, services=${tonyServiceList.length}, customers=${tonyCustomers.length}, bookings=${tonyBookings.length}`
    );

    const lunaBusiness = await prisma.business.create({
        data: {
            slug: "luna-salon",
            name: "Luna Salon",
            category: "salon",
            phone: "555-3000",
            city: "Jeddah",
            address: "Garden Ave 4",
            bio: "Modern styling and color services.",
        },
    });
    console.log("Created business: Luna Salon");

    const lunaOwner = await prisma.staff.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Luna Owner",
            can_login: true,
            email: "owner@luna.com",
            password_hash: passwordHash,
            role: "owner",
            phone: "555-3001",
        },
    });

    const lunaStaff = await prisma.staff.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Luna Staff",
            can_login: true,
            email: "staff@luna.com",
            password_hash: passwordHash,
            role: "staff",
            phone: "555-3002",
        },
    });

    const lunaAssistant = await prisma.staff.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Luna Assistant",
            can_login: false,
            role: "staff",
            phone: "555-3003",
        },
    });

    const lunaServices = {};
    lunaServices.hairStyling = await prisma.service.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Hair Styling",
            duration_mins: 40,
            price_usd: new Prisma.Decimal("25.00"),
        },
    });
    lunaServices.hairColoring = await prisma.service.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Hair Coloring",
            duration_mins: 90,
            price_usd: new Prisma.Decimal("60.00"),
        },
    });
    lunaServices.blowDry = await prisma.service.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Blow Dry",
            duration_mins: 30,
            price_usd: new Prisma.Decimal("20.00"),
        },
    });
    lunaServices.manicure = await prisma.service.create({
        data: {
            business_id: lunaBusiness.id,
            name: "Manicure",
            duration_mins: 30,
            price_usd: new Prisma.Decimal("15.00"),
        },
    });

    const lunaStaffMembers = [lunaOwner, lunaStaff, lunaAssistant];
    const lunaServiceList = Object.values(lunaServices);
    await prisma.staffService.createMany({
        data: lunaStaffMembers.flatMap((member) =>
            lunaServiceList.map((service) => ({
                staff_id: member.id,
                service_id: service.id,
            }))
        ),
    });

    await prisma.workingHours.createMany({
        data: [
            { business_id: lunaBusiness.id, day_of_week: 0, open_at: "00:00", close_at: "00:00", is_closed: true },
            { business_id: lunaBusiness.id, day_of_week: 1, open_at: "10:00", close_at: "20:00", is_closed: false },
            { business_id: lunaBusiness.id, day_of_week: 2, open_at: "10:00", close_at: "20:00", is_closed: false },
            { business_id: lunaBusiness.id, day_of_week: 3, open_at: "10:00", close_at: "20:00", is_closed: false },
            { business_id: lunaBusiness.id, day_of_week: 4, open_at: "10:00", close_at: "20:00", is_closed: false },
            { business_id: lunaBusiness.id, day_of_week: 5, open_at: "10:00", close_at: "20:00", is_closed: false },
            { business_id: lunaBusiness.id, day_of_week: 6, open_at: "10:00", close_at: "18:00", is_closed: false },
        ],
    });

    const lunaCustomers = [];
    lunaCustomers.push(
        await prisma.customer.create({
            data: { name: "Maha Noor", phone: "555-0101", preferred_language: "en" },
        })
    );
    lunaCustomers.push(
        await prisma.customer.create({
            data: { name: "Lina Abbas", phone: "555-0102", preferred_language: "ar" },
        })
    );
    lunaCustomers.push(
        await prisma.customer.create({
            data: { name: "Rana Adel", phone: "555-0103", preferred_language: "en" },
        })
    );
    lunaCustomers.push(
        await prisma.customer.create({
            data: { name: "Huda Karim", phone: "555-0104", preferred_language: "ar" },
        })
    );
    lunaCustomers.push(
        await prisma.customer.create({
            data: { name: "Dina Saleh", phone: "555-0105", preferred_language: "en" },
        })
    );

    const lunaBookings = [
        {
            customer: lunaCustomers[0],
            staff: lunaOwner,
            service: lunaServices.hairStyling,
            date: "2026-05-06",
            time: "10:00",
            status: "confirmed",
            source: "form",
            note: "Soft layers.",
        },
        {
            customer: lunaCustomers[1],
            staff: lunaStaff,
            service: lunaServices.hairColoring,
            date: "2026-05-06",
            time: "11:00",
            status: "pending",
            source: "voice",
        },
        {
            customer: lunaCustomers[2],
            staff: lunaAssistant,
            service: lunaServices.blowDry,
            date: "2026-05-06",
            time: "14:00",
            status: "cancelled",
            source: "form",
            cancelledBy: "business",
            cancellationReason: "Stylist unavailable.",
        },
        {
            customer: lunaCustomers[3],
            staff: lunaOwner,
            service: lunaServices.manicure,
            date: "2026-05-07",
            time: "12:00",
            status: "confirmed",
            source: "form",
        },
        {
            customer: lunaCustomers[4],
            staff: lunaStaff,
            service: lunaServices.blowDry,
            date: "2026-05-07",
            time: "15:00",
            status: "no_show",
            source: "voice",
        },
        {
            customer: lunaCustomers[0],
            staff: lunaAssistant,
            service: lunaServices.hairStyling,
            date: "2026-05-08",
            time: "10:30",
            status: "pending",
            source: "form",
        },
        {
            customer: lunaCustomers[1],
            staff: lunaOwner,
            service: lunaServices.manicure,
            date: "2026-05-08",
            time: "16:00",
            status: "confirmed",
            source: "form",
        },
        {
            customer: lunaCustomers[2],
            staff: lunaStaff,
            service: lunaServices.hairColoring,
            date: "2026-05-09",
            time: "10:00",
            status: "confirmed",
            source: "voice",
        },
        {
            customer: lunaCustomers[3],
            staff: lunaAssistant,
            service: lunaServices.blowDry,
            date: "2026-05-09",
            time: "17:00",
            status: "pending",
            source: "form",
        },
    ];

    for (const booking of lunaBookings) {
        await createBooking({
            businessId: lunaBusiness.id,
            ...booking,
        });
    }
    console.log(
        `Luna Salon seeded: staff=${lunaStaffMembers.length}, services=${lunaServiceList.length}, customers=${lunaCustomers.length}, bookings=${lunaBookings.length}`
    );
    console.log("Seed complete.");
}

async function runSeed() {
    let hasError = false;

    try {
        await main();
    } catch (error) {
        hasError = true;
        console.error(error);
    } finally {
        await prisma.$disconnect();
        if (hasError) {
            process.exit(1);
        }
    }
}

runSeed();
