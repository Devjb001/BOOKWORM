import express, { Router } from 'express';
import cloudinary from "../config/cloudinary.js"
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.middleware.js';
import multer from 'multer';


const router = express.Router();

// Multer setup: store files in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CREATE BOOK ROUTE
router.post(
  "/create-book",
  protectRoute,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, caption, rating } = req.body;

      if (!title || !caption || !rating || !req.file) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Upload to Cloudinary using buffer
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bookworm" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const uploadResponse = await streamUpload(req.file.buffer);

      const newBook = new Book({
        title,
        caption,
        rating,
        image: uploadResponse.secure_url,
        user: req.user._id,
      });

      await newBook.save();

      res.status(201).json({
        message: "Book created successfully",
        book: newBook,
      });
    } catch (error) {
      console.error("Error creating book", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET ALL BOOKS ROUTE
router.get("/books", protectRoute, async(req, res) => {
    try {
        // pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        // get books from db
        const books = await Book.find()
            .sort({createdAt : -1})
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

            const totalBooks = await Book.countDocuments();
            const totalPages = Math.ceil(totalBooks / limit);
        res.status(200).json({
            books,
            currentPage : page,
            totalBooks,
            totalPages
        })
    } catch (error) {
        console.log("error fetching books", error);
        res.status(500).json({message : "Server error"});
    }
})


// DELETE BOOK ROUTE
router.delete("/book/:id", protectRoute, async(req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message : "Book not found"});
        }
        // check if the user is the creator of the book
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(403).json({message : "You are not authorized to delete this book"});
        }
        // delete image from cloudinary
        if(book.image && book.image.includes("res.cloudinary.com")){
           try {
            const publicId = book.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
           } catch (deleteError) {
            console.log("error deleting image from cloudinary", deleteError);
           }
        }

        // delete book from db
        await book.deleteOne();

        res.status(200).json({message : "Book deleted successfully"});
    } catch (error) {
        console.log("error deleting book", error);
        res.status(500).json({message : "Server error"});
    }
})

// GET YOUR RECOMMENDED BOOKS
router.get("/recommended-books", protectRoute, async(req, res) =>{
    try {
        const userBooks = (await Book.find({user : req.user._id})).sort({createdAt : -1});
        if(userBooks.length === 0){
            return res.status(200).json({recommendedBooks : []});
        }
        res.status(200).json({recommendedBooks : userBooks});
    } catch (error) {
        console.log("error fetching recommended books", error);
        res.status(500).json({message : "Server error"});
    }
})

export default router;