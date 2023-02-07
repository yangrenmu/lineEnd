// const Crawler = require('crawler');
import Crawler from 'crawler';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

interface Data {
  total?: number; // 总指数
  zwgj?: number; // 植物根茎类
  zwp?: number; // 植物皮类
  zwy?: number; // 植物叶类
  zwh?: number; // 植物花类
  zwgz?: number; // 植物果种类
  zwqt?: number; // 植物其他类
  dw?: number; // 动物类
  kw?: number; // 矿物类
  zwjm?: number; // 植物茎木类
  qc?: number; // 全草类
  zjdy?: number; // 藻菌地衣类
  sz?: number; // 树脂类
}

interface KeyType {
  植物根茎: string;
  植物皮: string;
  植物叶: string;
  植物花: string;
  植物果种: string;
  植物其他: string;
  动物: string;
  矿物: string;
  植物茎木: string;
  全草: string;
  藻菌地衣: string;
  树脂: string;
}

const Type: KeyType = {
  植物根茎: 'zwgj',
  植物皮: 'zwp',
  植物叶: 'zwy',
  植物花: 'zwh',
  植物果种: 'zwgz',
  植物其他: 'zwqt',
  动物: 'dw',
  矿物: 'kw',
  植物茎木: 'zwjm',
  全草: 'qc',
  藻菌地衣: 'zjdy',
  树脂: 'sz',
};

const domain = 'https://www.ndrc.gov.cn/fgsj/shjgjgzs/cdzy/';
const __dirname = path.resolve();

function getFirstData(content: string): Data {
  const data: Data = {};
  const firstStr = content.split('其中，')[1];
  const nameNumArr = firstStr?.split('分别为');
  const nameStr = nameNumArr[0];
  const numStr = nameNumArr[1]?.split('，')[0];
  const numArr = numStr?.split('、');
  nameStr.split('、').forEach((v: string, index: number) => {
    const name = v.split('类')[0];
    const keyName = Type[name as keyof typeof Type];
    if (keyName) {
      data[keyName as keyof typeof data] = +numArr[index]?.split('点')[0];
    }
  });
  return data;
}

function getSecondData(content: string): Data {
  const data: Data = {};
  const firstStr = content.split('%；')[1];
  const nameNumArr = firstStr?.split('分别为');
  const nameStr = nameNumArr[0];
  const numStr = nameNumArr[1]?.split('，')[0];
  const numArr = numStr?.split('、');
  nameStr.split('、').forEach((v: string, index: number) => {
    const name = v.split('类')[0];
    const keyName = Type[name as keyof typeof Type];
    if (keyName) {
      data[keyName as keyof typeof data] = +numArr[index]?.split('点')[0];
    }
  });
  return data;
}

function getData(content: string): Data {
  if (!content) return {};
  let data = {};
  data = { ...getFirstData(content) };
  data = { ...getSecondData(content), ...data };
  return data;
}

function getTotal(content: string): number {
  if (!content) return 0;
  const firstStr = content.split('点（以')[0];
  const numStr = firstStr?.split('指数为')[1];
  return +numStr || 0;
}

const crawlInfo = new Crawler({
  callback: (
    error: Error,
    res: Crawler.CrawlerRequestResponse,
    done: () => void
  ) => {
    if (error) {
      console.log(chalk.red('crawlInfo error: ', error));
    } else {
      const $ = res.$;
      const name = $('.article_title')?.text()?.split('份')[0];
      const content = $('.Custom_UnionStyle p').eq(1)?.text();
      let data: Data = {};
      data = getData(content);
      data.total = getTotal(content);
      // console.log(chalk.green('-------------- data: --------------'), data);
      try {
        fs.writeFileSync(
          path.join(__dirname, 'data', `${name}.json`),
          JSON.stringify(data, null, 2)
        );
        console.log(chalk.green(`save ${name} data success.`));
      } catch (error) {
        console.log(chalk.red(`save ${name} data error:`, error));
      }
    }
    done();
  },
});

const crawl = new Crawler({
  callback: (
    error: Error,
    res: Crawler.CrawlerRequestResponse,
    done: () => void
  ) => {
    if (error) {
      console.log(chalk.red('crawl error: ', error));
    } else {
      const $ = res.$;
      const ul = $('.u-list');
      const linkList: string[] = [];
      ul.children().each((index, element) => {
        const a = $(element).children('a');
        const aText = a.text();
        if (aText) {
          if (aText.indexOf('月份') !== -1) {
            const link = a.attr('href') || '';
            linkList.push(`${domain}${link.slice(2)}`);
          }
        }
      });
      if (linkList.length > 0) {
        crawlInfo.queue(linkList);
      }
    }
    done();
  },
});

console.log(chalk.green('start...'));

function medicineSpider() {
  crawl.queue(domain);
}

medicineSpider();

export { medicineSpider };
