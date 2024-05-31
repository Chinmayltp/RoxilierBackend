const fs = require("fs");
const axios = require("axios");

const db = new sqlite3.Database("database.db");

// URL of the JSON data
const url = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

axios
  .get(url)
  .then((response) => {
    const jsonData = response.data;

    const insertStatement = db.prepare(
      "INSERT INTO products (title, price, description, category, image, sold, dateOfSale) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    db.serialize(() => {
      jsonData.forEach((product) => {
        insertStatement.run(
          product.title,
          product.price,
          product.description,
          product.category,
          product.image,
          product.sold,
          product.dateOfSale
        );
      });

      // Finalize the statement to close it
      insertStatement.finalize();

      console.log("Database initialized with seed data.");
    });

    // Close the database connection
    db.close();
  })
  .catch((error) => {
    console.error("Error fetching data from the URL:", error.message);
    // Handle the error as needed
  });
