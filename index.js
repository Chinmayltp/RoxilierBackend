let express = require("express");
const cors = require("cors");
let app = express();
module.exports = app;

app.use(cors());

app.use(express.json());
let sqlite = require("sqlite");
let sqlite3 = require("sqlite3");

let { open } = sqlite;
let path = require("path");
let dbpath = path.join(__dirname, "database.db");

let db = null;
let intializeDBAndServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server Started at http://localhost:3000/");
  });
};
intializeDBAndServer();

app.get("/", async (req, res) => {
  try {
    res.send("Welcome to get the data");
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const search = req.query.search ? req.query.search.toLowerCase() : "";
    const selectedMonth = req.query.month.toLowerCase() || "march";

    const monthMap = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const numericMonth = monthMap[selectedMonth.toLowerCase()];

    const rows = await db.all([numericMonth]);

    res.json({
      page,
      perPage,
      transactions: rows,
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/statistics", async (req, res) => {
  try {
    console.log("Request received for /statistics");
    const selectedMonth = req.query.month || "march";
    console.log("Selected Month:", selectedMonth);

    if (!selectedMonth) {
      return res.status(400).json({ error: "Month parameter is required." });
    }

    // Convert month names to numers
    const monthMap = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const numericMonth = monthMap[selectedMonth.toLowerCase()];

    if (!numericMonth) {
      return res.status(400).json({ error: "Invalid month name." });
    }

    const statistics = await db.get(sqlQuery, [numericMonth]);

    if (!statistics) {
      return res
        .status(404)
        .json({ error: "No data found for the selected month." });
    }

    res.json({
      selectedMonth,
      totalSaleAmount: Math.floor(statistics.totalSaleAmount) || 0,
      totalSoldItems: statistics.totalSoldItems || 0,
      totalNotSoldItems: statistics.totalNotSoldItems || 0,
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/bar-chart", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";

    // Convert month names to numers
    const monthMap = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    if (!selectedMonth) {
      return res.status(400).json({ error: "Month parameter is required." });
    }

    const numericMonth = monthMap[selectedMonth.toLowerCase()];

    const barChartData = await db.all(sqlQuery, [numericMonth]);

    res.json(barChartData);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/pie-chart", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";

    if (!selectedMonth) {
      return res.status(400).json({ error: "Month parameter is required." });
    }

    // Convert month names to numbers
    const monthMap = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const numericMonth = monthMap[selectedMonth.toLowerCase()];

    const pieChartData = await db.all(sqlQuery, [numericMonth]);

    res.json(pieChartData);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/combined-response", async (req, res) => {
  try {
    const selectedMonth = req.query.month || "march";
    const { search, page, perPage } = req.query;

    if (!selectedMonth) {
      return res.status(400).json({ error: "Month parameter is required." });
    }

    const monthMap = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };

    const numericMonth = monthMap[selectedMonth.toLowerCase()];

    // Fetch data from the four APIs
    const transactionsData = await fetchTransactions(
      numericMonth,
      search,
      page || 1,
      perPage || 10
    );
    const statisticsData = await fetchStatistics(numericMonth);
    const barChartData = await fetchBarChart(numericMonth);
    const pieChartData = await fetchPieChart(numericMonth);

    // Combine the responses into a single JSON object
    const combinedResponse = {
      transactions: transactionsData,
      statistics: statisticsData,
      barChart: barChartData,
      pieChart: pieChartData,
    };

    res.json(combinedResponse);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to fetch transactions data
// Function to fetch transactions data with search, pagination, and month filter
async function fetchTransactions(numericMonth, search, page, perPage) {
  const transactionsData = await db.all(sqlQuery, [numericMonth]);
  return transactionsData;
}

// Function to fetch statistics data
async function fetchStatistics(numericMonth) {
  const statisticsData = await db.get(sqlQuery, [numericMonth]);
  return statisticsData;
}

// Function to fetch bar chart data
async function fetchBarChart(numericMonth) {
  const barChartData = await db.all(sqlQuery, [numericMonth]);
  return barChartData;
}

// Function to fetch pie chart data
async function fetchPieChart(numericMonth) {
  const pieChartData = await db.all(sqlQuery, [numericMonth]);
  return pieChartData;
}
