const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cinemaDB')
    .then(() => console.log('Connected to MongoDB database: cinemaDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// --- SCHEMAS ---
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

// --- ROUTES ---

// 1. Get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const query = req.query.genre ? { genre: req.query.genre } : {};
        const movies = await Movie.find(query);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1b. Update a movie (change all details)
app.put('/api/movies/:id', async (req, res) => {
    try {
        const { title, genre, duration, rating, ticket_price, show_times } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, genre, duration, rating, ticket_price, show_times },
            { new: true, runValidators: true }
        );
        if (!updatedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie updated successfully', movie: updatedMovie });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a customer
app.post('/api/customers', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        // Check if customer exists
        let customer = await Customer.findOne({ email });
        if (!customer) {
            customer = new Customer({ name, phone, email });
            await customer.save();
        }
        res.status(201).json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create a booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, phone, email, movie_id, show_time, seats } = req.body;
        
        // Find or create customer
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = new Customer({ name, phone, email: email || 'N/A' });
            await customer.save();
        }

        const newBooking = new Booking({
            customer_id: customer._id,
            movie_id,
            show_time,
            seats,
            booking_date: new Date()
        });

        await newBooking.save();
        res.status(201).json({ message: 'Booking successful!', booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer_id', 'name phone')
            .populate('movie_id', 'title ticket_price')
            .sort({ booking_date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ message: 'Booking canceled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
