import { getStockQuotes } from 'backend/yahoo.jsw';
import { getStockTickers } from 'backend/newYahoo.jsw';

$w.onReady(async function () {

//new code 

 fetchAndUpdateStockData();

$w("#refresh").onClick(() => {
    $w("#table1").rows = [];
        console.log("Refresh button clicked. Refreshing in 1 second...");
        setTimeout(() => {
            fetchAndUpdateStockData();
        }, 1000); // 1000 milliseconds = 1 second
    });

    // await loadStockData();

    // // Navigation buttons
    // $w("#button23").onClick(() => $w("#multiStateBox1").changeState("state2")); // Next
    // $w("#button24").onClick(() => $w("#multiStateBox1").changeState("state1")); // Back

    // // Reset buttons
    // $w("#button22").onClick(async () => await loadStockData()); // Refresh State 1
    // $w("#button26").onClick(async () => await loadStockData()); // Refresh State 2


});
// async function loadStockData() {
//     try {
//         // Fetch stock data from the backend
//         const stocks = await getStockQuotes();
        
//         // Check if the returned data indicates an error
//         if (!stocks || stocks.error) {
//             console.error("Error: ", stocks ? stocks.error : "No data returned.");
//             return;
//         }

//         // Check if we have enough stocks to display (at least 20)
//         if (stocks.length < 20) {
//             console.warn("Not enough stock data. Expected at least 20 items.");
//             return;
//         }

//         // Slice the first 10 companies for Repeater2
//         const firstHalf = stocks.slice(0, 10);
//         $w("#repeater2").data = firstHalf.map(stock => ({
//             _id: stock.symbol,  // Used for unique identification
//             name: stock.shortName,
//             price: `$${stock.regularMarketPrice.toFixed(2)}`,
//             changeDollar: `${stock.regularMarketChange.toFixed(2)}`,
//             changePercentage: `${stock.regularMarketChangePercent.toFixed(2)}%`
//         }));

//         // Slice the next 10 companies for Repeater3
//         const secondHalf = stocks.slice(10, 20);
//         $w("#repeater3").data = secondHalf.map(stock => ({
//             _id: stock.symbol,  // Used for unique identification
//             name: stock.shortName,
//             price: `$${stock.regularMarketPrice.toFixed(2)}`,
//             changeDollar: `${stock.regularMarketChange.toFixed(2)}`,
//             changePercentage: `${stock.regularMarketChangePercent.toFixed(2)}%`
//         }));

//         // Set up itemReady function for Repeater2
//         $w("#repeater2").onItemReady(($item, itemData, index) => {
//             $item("#text82").text = itemData.name;
//             $item("#text83").text = itemData.price;
//             $item("#text84").text = itemData.changeDollar;
//             $item("#text85").text = itemData.changePercentage;
//         });

//         // Set up itemReady function for Repeater3
//         $w("#repeater3").onItemReady(($item, itemData, index) => {
//             $item("#text86").text = itemData.name;
//             $item("#text87").text = itemData.price;
//             $item("#text88").text = itemData.changeDollar;
//             $item("#text89").text = itemData.changePercentage;
//         });

//         console.log("Stock data loaded and repeaters updated successfully.");

//     } catch (error) {
//         console.error("Failed to load stock data:", error);
//     }
// }

//new code
async function fetchAndUpdateStockData() {
    try {
        // Fetch stock ticker data from the backend
        const stockData = await getStockTickers();

        if (!stockData || stockData.length === 0) {
            console.warn("No stock data found.");
            $w("#table1").rows = []; // Clear table if no data
            $w("#totalPriceText").text = "Total Price: $0.00";
            $w("#percentageText").text = "Average Price as Percentage: 0.00%";
            return;
        }

        // Format data for the table (Remove '$' and convert to number)
        const tableData = stockData.map((stock, index) => {
            // Remove any dollar sign and commas, then parse
            const priceString = stock.lastsale ? stock.lastsale.replace(/\$/g, "").replace(/,/g, "") : "0";
            const price = parseFloat(priceString) || 0; // Convert to number

            return {
                id: index + 1,
                company: stock.name || "N/A",
                price: price, // Numeric price
                change: stock.netchange || "N/A",
                changeP: stock.pctchange || "N/A"
            };
        });

        // Assign data to table
        $w("#table1").rows = tableData;
        console.log("Stock data updated successfully.");

        // Calculate total price of all stocks
        const totalPrice = tableData.reduce((sum, stock) => sum + stock.price, 0);

        // Total number of responses
        const totalResponses = tableData.length;

        // Calculate average price per stock
        const averagePrice = totalResponses > 0 ? totalPrice / totalResponses : 0;

        // Calculate the percentage of average price relative to the total price.
        // This is: (averagePrice / totalPrice) * 100, which simplifies to (1/totalResponses) * 100.
        const percentage = totalResponses > 0 && totalPrice > 0 ? (averagePrice / totalPrice) * 100 : 0;

        console.log("Total Stock Price:", totalPrice.toFixed(2));
        console.log("Total Responses:", totalResponses);
        console.log("Average Price:", averagePrice.toFixed(2));
        console.log("Percentage:", percentage.toFixed(2) + "%");

        // Update UI with calculated values
        $w("#totalPriceText").text = `$${totalPrice.toFixed(2)}`;
        $w("#percentageText").text = `${percentage.toFixed(2)}%`;

    } catch (error) {
        console.error("Error fetching stock data:", error);
        $w("#totalPriceText").text = "Error fetching data";
        $w("#percentageText").text = "";
    }
}
