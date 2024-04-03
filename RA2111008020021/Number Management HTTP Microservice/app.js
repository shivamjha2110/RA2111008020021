const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let storedNumbers = [];

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`http://20.244.56.144/test/${type}`);
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return [];
    }
};

const calculateAverage = (arr) => {
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return sum / arr.length;
};

app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    const startTime = Date.now();

    const fetchedNumbers = await fetchNumbers(type);

    storedNumbers = storedNumbers.filter(num => !fetchedNumbers.includes(num));
    storedNumbers.push(...fetchedNumbers);

    storedNumbers = [...new Set(storedNumbers)].slice(-WINDOW_SIZE);

    let average = null;
    if (storedNumbers.length === WINDOW_SIZE) {
        average = calculateAverage(storedNumbers);
    }

    const responseTime = Date.now() - startTime;
    const windowPrevState = storedNumbers.slice(0, storedNumbers.length - fetchedNumbers.length);
    const windowCurrState = storedNumbers;

    const responseObject = {
        windowPrevState,
        windowCurrState,
        numbers: storedNumbers,
        avg: average
    };

    res.json(responseObject);
    console.log(`Response time: ${responseTime}ms`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});