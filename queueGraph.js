let chartOptions = {
    colors: [
        "#8FBCBB"    
    ],
    chart: {
        type: 'area',
        width: '100%',
        animations: {
            enabled: false
        },
    },
    stroke: {
       curve: 'stepline',
    },
    dataLabels: {
       enabled: false,
    },
    xaxis: {
        type: 'datetime',
    },
}

let getData = async () => {
    return fetch('/queueStats.csv', {cache: 'reload'}).then(it => it.text());
}

let handleData = (data) => {
    const lines = data.split('\n');
    return lines.slice(1, -1).map(it => it.split(',').map(it => parseInt(it)));
}

let getJsData = async () => {
    return handleData(await getData());
}

let dailyChart = undefined;

let getAdjustedData = async function() {
    let chartData = await getJsData(); 
    let adjustedData = chartData.map(it => [(it[0] - 21600) * 1000, it[1]]);
    adjustedData.push([new Date().getTime() - 21600000, 0]);
    return adjustedData;
}

let createDailyChart = () => getAdjustedData().then(adjustedData => {
    let start = new Date();
    start.setHours(3, 0, 0);
    let end = new Date();
    end.setHours(15, 0, 0);
    let customOptions = {
        ...chartOptions,
        series: [{
            name: "Number of Clients",
            data: [...adjustedData],
        }],
        xaxis: {
            type: 'datetime',
            min: start.getTime(),
            max: end.getTime(),
        },
    }

    dailyChart = new ApexCharts(document.querySelector('#daily'), customOptions);
    dailyChart.render();
    setInterval(async () => {dailyChart.updateSeries([{name: "Number of Clients", data: await getAdjustedData()}], true)}, 1000 * 60);
});

let historicalChart = undefined;

let createChart = () => getAdjustedData().then(adjustedData => {
    let customOptions = { 
        ...chartOptions,
        series: [{
            name: "Number of Clients",
            data: [...adjustedData],
        }],
    };
    historicalChart = new ApexCharts(document.querySelector('#historical'), customOptions);
    historicalChart.render();
    setInterval(async () => {historicalChart.updateSeries([{name: "Number of Clients", data: await getAdjustedData()}], true)}, 1000 * 60);
});

createDailyChart();
createChart();
