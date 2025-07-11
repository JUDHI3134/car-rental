import Booking from "../models/Booking.js"
import Car from "../models/Car.js"


//function to check availability of car for a given date
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: {$gte: pickupDate}
    })

    return bookings.length === 0
}

//API to check availability of car for a given date and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        
        //fetch all available car for given location
        const cars = await Car.find({ location, isAvaliable: true })
        
        //check availability of car for a given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate);
            return {...car._doc, isAvaliable: isAvaliable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvaliable === true);

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message}) 
    }
}

//Api to create booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);

        if (!isAvailable) {
            return res.json({success: false, message: "Car is not available"})
        }

        const carData = await Car.findById(car);

        //calculate price based on pickup and return date
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({
            car, owner: carData.owner, user: _id, pickupDate, returnDate, price
        })

        res.json({success: true, message: "car booked"})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}