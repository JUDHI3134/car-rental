import imagekit from "../configs/imagekit.js";
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
                { width: 1280 },
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