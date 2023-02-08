import dayjs from 'dayjs';
import express from 'express';
import fs from 'fs';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PATCH, PUT, DELETE'
  );
  res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE');
  next();
});

app.get('/medicine', (req, res) => {
  const { type = 'total' } = req.query;
  const fileNameList = fs.readdirSync('./data')?.slice(-24) || [];
  const data: object[] = [];
  if (fileNameList.length > 0) {
    const list = fileNameList.sort((a, b) => {
      let timeA: string | number = a.split('月')[0].replace(/年/, '-');
      let timeB: string | number = b.split('月')[0].replace(/年/, '-');
      timeA = dayjs(timeA).unix();
      timeB = dayjs(timeB).unix();
      return timeA - timeB;
    });
    list.forEach((v) => {
      const json = fs.readFileSync(`./data/${v}`, 'utf8');
      const jsonData = JSON.parse(json);
      const value = jsonData[type as keyof typeof jsonData];
      if (value) {
        data.push({ name: v.split('.')[0], value });
      }
    });
  }
  res.json({
    data: data,
  });
});

app.listen(5000, () => {
  console.log('Running on port 5000.');
});
