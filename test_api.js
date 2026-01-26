const axios = require('axios');

async function test() {
    try {
        const response = await axios.get('http://localhost:5000/api/rates');
        console.log("Status:", response.status);
        console.log("Response Body Structure:", Object.keys(response.data));
        console.log("Data field type:", Array.isArray(response.data.data) ? 'Array' : typeof response.data.data);
        console.log("Data field content sample:", response.data.data.slice(0, 1));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

test();
