const fs = require("fs");
const csv = require("fast-csv");
const Book = require("../models/Book");

// ─── Helpers ────────────────────────────────────────────────────────────────

const REQUIRED_CSV_FIELDS = [
  "Accession Number", "Author Name", "Book Name",
  "Category", "Publication", "Year", "Total Pages", "Supplier", "Price",
];

/** Normalise CSV header variants → canonical field name */
const resolveField = (row, ...keys) =>
  keys.map((k) => row[k]).find((v) => v !== undefined && v !== "");

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// ─── GET /api/books  (public) ────────────────────────────────────────────────

exports.getAllBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const filter = search
      ? {
        $or: [
          { bookName: { $regex: search, $options: "i" } },
          { authorName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { publication: { $regex: search, $options: "i" } },
          { accessionNumber: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("[Book] getAllBooks:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch books." });
  }
};

// ─── PUT /api/books/:id  (librarian) ────────────────────────────────────────

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID." });
    }

    const { bookName, authorName, category, publication, year, totalPages, supplier, price } =
      req.body;

    // Only update fields that were actually sent
    const updates = {};
    if (bookName) updates.bookName = bookName.trim();
    if (authorName) updates.authorName = authorName.trim();
    if (category) updates.category = category.trim();
    if (publication) updates.publication = publication.trim();
    if (supplier) updates.supplier = supplier.trim();

    if (year !== undefined) {
      const y = Number(year);
      if (isNaN(y)) return res.status(400).json({ success: false, message: "Year must be numeric." });
      updates.year = y;
    }
    if (totalPages !== undefined) {
      const p = Number(totalPages);
      if (isNaN(p)) return res.status(400).json({ success: false, message: "Total pages must be numeric." });
      updates.totalPages = p;
    }
    if (price !== undefined) {
      const pr = Number(price);
      if (isNaN(pr)) return res.status(400).json({ success: false, message: "Price must be numeric." });
      updates.price = pr;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided to update." });
    }

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    res.json({ success: true, message: "Book updated successfully.", book });
  } catch (err) {
    console.error("[Book] updateBook:", err.message);
    res.status(500).json({ success: false, message: "Failed to update book." });
  }
};

// ─── DELETE /api/books/:id  (librarian) ─────────────────────────────────────

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID." });
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    res.json({ success: true, message: "Book deleted successfully." });
  } catch (err) {
    console.error("[Book] deleteBook:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete book." });
  }
};

// ─── POST /api/books/bulk-import  (librarian) ────────────────────────────────

exports.bulkImportBooksCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const filePath = req.file.path;
  const toInsert = [];
  const duplicates = [];
  const errors = [];

  try {
    const existingNums = new Set(
      (await Book.find({}, "accessionNumber").lean()).map((b) => b.accessionNumber)
    );

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true, trim: true }))
        .on("error", reject)
        .on("data", (row) => {
          const accessionNumber = resolveField(row, "Accession Number", "accession number", "accessionNumber");
          const authorName = resolveField(row, "Author Name", "author name", "authorName");
          const bookName = resolveField(row, "Book Name", "book name", "bookName");
          const category = resolveField(row, "Category", "category");
          const publication = resolveField(row, "Publication", "publication");
          const yearRaw = resolveField(row, "Year", "year");
          const pagesRaw = resolveField(row, "Total Pages", "total pages", "totalPages");
          const supplier = resolveField(row, "Supplier", "supplier");
          const priceRaw = resolveField(row, "Price", "price");

          // Missing field check
          const missing = [
            !accessionNumber && "Accession Number",
            !authorName && "Author Name",
            !bookName && "Book Name",
            !category && "Category",
            !publication && "Publication",
            !yearRaw && "Year",
            !pagesRaw && "Total Pages",
            !supplier && "Supplier",
            !priceRaw && "Price",
          ].filter(Boolean);

          if (missing.length) {
            errors.push({ accessionNumber: accessionNumber || "Unknown", error: `Missing: ${missing.join(", ")}` });
            return;
          }

          // Numeric check
          const year = Number(yearRaw);
          const pages = Number(pagesRaw);
          const price = Number(priceRaw);

          if (isNaN(year) || isNaN(pages) || isNaN(price)) {
            errors.push({ accessionNumber, error: "Year, Total Pages and Price must be numeric." });
            return;
          }

          // Duplicate check (in DB + within this CSV)
          if (existingNums.has(accessionNumber)) {
            duplicates.push({ accessionNumber, error: "Duplicate accession number." });
            return;
          }

          toInsert.push({
            accessionNumber, authorName, bookName, category, publication,
            year, totalPages: pages, supplier, price, addedBy: req.user._id
          });
          existingNums.add(accessionNumber); // prevent within-CSV dupes
        })
        .on("end", resolve);
    });

    let inserted = 0;
    if (toInsert.length) {
      const result = await Book.insertMany(toInsert, { ordered: false }).catch((err) => {
        inserted = err.insertedDocs?.length ?? 0;
        console.error("[Book] insertMany partial error:", err.message);
        return null;
      });
      if (result) inserted = result.length;
    }

    res.status(201).json({
      success: true,
      message: "Bulk import complete.",
      summary: { inserted, duplicates: duplicates.length, errors: errors.length },
      duplicates,
      errors,
    });
  } catch (err) {
    console.error("[Book] bulkImport:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Error processing file." });
    }
  } finally {
    try { fs.unlinkSync(filePath); } catch (_) { }
  }
};
