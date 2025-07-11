import imagekit from "../configs/imagekit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs"

//Api to change role of user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findOneAndUpdate(_id, { role: "owner" });
        res.json({success: true, message: "Now you can list Car"})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//API to List a Car
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        //upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        });

        // optimize through imagekit url transforamtion
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' },
                {format: "webp"}
            ]
        });

        const image = optimizedImageUrl;

        await Car.create({ ...car, owner: _id, image })
        
        res.json({success: true, message: "Car Added"})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//API to List owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({success: true, cars})
    } catch (error) {
       console.log(error)
        res.json({success: false, message: error.message}) 
    }
}

//Api to toggle car avaliability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId)

        //checking is car belongs to user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({success: false, message:"Not Authorized"})
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save();

        res.json({success: true, message: "Update Availability"})
    } catch (error) {
       console.log(error)
        res.json({success: false, message: error.message}) 
    }
}


//Api to delete a car
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId)

        //checking is car belongs to user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({success: false, message:"Not Authorized"})
        }

        car.owner = null;
        car.isAvaliable = false;
        await car.save();

        res.json({success: true, message: "Car Removed"})
    } catch (error) {
       console.log(error)
        res.json({success: false, message: error.message}) 
    }
}

//APi to get dahboard data
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner') {
            return res.json({success: false, message: "UnaAthorized"})
        }

        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate("car").sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({owner: _id, status: 'pending'})
        const completedBookings = await Booking.find({ owner: _id, status: 'confirmed' })
        
        //Calculate monthly revenue frm bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }

        res.json({success: true, dashboardData})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message}) 
    }
}

//Api to update user image
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;

        const imageFile = req.file;

        //upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        });

        // optimize through imagekit url transforamtion
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation: [
                { width: '400' },
                { quality: 'auto' },
                {format: "webp"}
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({success: true, message: "Image updated"})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message}) 
    }
}