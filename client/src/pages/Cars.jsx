import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets, dummyCarData } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import {motion} from "motion/react"

const Cars = () => {

  //getting search params from url
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { cars, axios } = useAppContext();

  const isSearchData = pickupLocation && pickupDate && returnDate
  const [filteredCars, setFilteredCars] = useState([])

  const [input, setInput] = useState("")

  const applyFilter = async () => {
    if (input === '') {
      setFilteredCars(cars);
      return null;
    }

    const filtered = cars.slice().filter((car) => {
      return car.brand.toLowerCase().includes(input.toLowerCase())
      || car.model.toLowerCase().includes(input.toLowerCase())
      || car.category.toLowerCase().includes(input.toLowerCase())
      || car.transmission.toLowerCase().includes(input.toLowerCase())
    })

    setFilteredCars(filtered)

  }

  const searchAvailability = async () => {
    try {
      const { data } = await axios.post("/api/bookings/check-availability", { location: pickupLocation, pickupDate, returnDate });

      if (data.success) {
        setFilteredCars(data.availableCars);
        if (data.availableCars.length === 0) {
          toast("No car available")
        }
        return null
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    cars.length > 0 && !isSearchData && applyFilter();
  },[input, cars])


  useEffect(() => {
    isSearchData && searchAvailability();
  },[])

  

  return (
    <div>

      {/* ---------------------------------------- */}
      <motion.div
       initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        className='flex flex-col items-center py-20 bg-light max-md:py-4'>
        <Title title="Available Cars" subTitle={"Browse our selection of premium vehicle available for your next Adventure"} />

        <motion.div
         initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img alt="" src={assets.search_icon} className='w-4.5 h-4.5 mr-2' />
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model and feature' className='w-full h-full outline-none text-gray-500' />
            <img alt="" src={assets.filter_icon} className='w-4.5 h-4.5 ml-2'/>
        </motion.div>

      </motion.div>


      {/* ------------------------------- */}
      <motion.div
       initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        className='mt-10 px-6 md:px-16 lg:px-24 xl:px-32'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index) => (
            <motion.div
             initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1*index }}
              key={index}>
              <CarCard car={car} />
            </motion.div>
            ))}
        </div>

      </motion.div>


    </div>
  )
}

export default Cars
