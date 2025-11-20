import cron from 'cron';
import https from 'https';

const job = new cron.CronJob("*/14 * * * *" , function () {
    https
    .get(process.env.API_URI, (res) => {
        if(res.statusCode === 200){
            console.log('Get request sent successfully');
        }else{
            console.log('Get request failed with status code:', res.statusCode);
        }
    })
    .on('error', (e) => {
        console.error('Error during GET request:', e);
    });
})

export default job;