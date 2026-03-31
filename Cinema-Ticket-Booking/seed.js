const mongoose = require('mongoose');

// Wait to connect
mongoose.connect('mongodb://localhost:27017/cinemaDB')
    .then(() => {
        console.log('Connected to MongoDB database: cinemaDB');
        seedDatabase();
    })
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Schemas
const movieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    duration: Number,
    rating: Number,
    ticket_price: Number,
    show_times: [String]
});

const customerSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String
});

const bookingSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MovieCustomer' },
    movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    show_time: String,
    seats: Number,
    booking_date: { type: Date, default: Date.now }
});

const Movie = mongoose.model('Movie', movieSchema, 'movies');
const Customer = mongoose.model('MovieCustomer', customerSchema, 'customers');
const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

async function seedDatabase() {
    try {
        console.log('Clearing existing data...');
        await Movie.deleteMany({});
        await Customer.deleteMany({});
        await Booking.deleteMany({});

        console.log('Inserting movies...');
        const moviesToInsert = [
            { title: "Inception", genre: "Sci-Fi", duration: 148, rating: 8.8, ticket_price: 15.00, show_times: ["10:00 AM", "1:00 PM", "6:00 PM"] },
            { title: "The Dark Knight", genre: "Action", duration: 152, rating: 9.0, ticket_price: 18.00, show_times: ["11:00 AM", "3:00 PM", "8:00 PM"] },
            { title: "Interstellar", genre: "Sci-Fi", duration: 169, rating: 8.6, ticket_price: 16.50, show_times: ["12:00 PM", "4:00 PM", "9:00 PM"] },
            { title: "Avatar", genre: "Sci-Fi", duration: 162, rating: 7.8, ticket_price: 14.00, show_times: ["1:00 PM", "5:00 PM", "9:00 PM"] },
            { title: "The Matrix", genre: "Action", duration: 136, rating: 8.7, ticket_price: 12.00, show_times: ["10:30 AM", "2:30 PM", "7:30 PM"] }
        ];

        const insertedMovies = await Movie.insertMany(moviesToInsert);
        console.log(`Inserted ${insertedMovies.length} movies.`);

        console.log('Inserting sample customers...');
        const customersToInsert = [
            { name: "John Doe", phone: "1234567890", email: "john@example.com" },
            { name: "Jane Smith", phone: "0987654321", email: "jane@example.com" }
        ];
        const insertedCustomers = await Customer.insertMany(customersToInsert);
        console.log(`Inserted ${insertedCustomers.length} customers.`);

        console.log('Inserting sample bookings...');
        const bookingsToInsert = [
            {
                customer_id: insertedCustomers[0]._id,
                movie_id: insertedMovies[0]._id,
                show_time: "6:00 PM",
                seats: 2,
                booking_date: new Date()
            },
            {
                customer_id: insertedCustomers[1]._id,
                movie_id: insertedMovies[1]._id,
                show_time: "8:00 PM",
                seats: 4,
                booking_date: new Date()
            }
        ];

        const insertedBookings = await Booking.insertMany(bookingsToInsert);
        console.log(`Inserted ${insertedBookings.length} bookings.`);

        console.log('Database successfully seeded!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.disconnect();
    }
}
