import Parser from 'rss-parser';
import Arweave from "arweave"
import { writeFileSync } from 'fs';


interface Person {
    name: string;
}

type CustomFeed = { foo: string };
type CustomItem = { bar: number };

async function main() {
    const p: Person = {
        name: "John"
    }
    console.log(`Hello World: ${p.name}`);


    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });

    const txData = await arweave.transactions.get("5GDUuTSr-ECmHZ3YjtCCoSXZzd0ZeELE5LlYRPErISY")
    
    const buffer = Buffer.from(txData.data)
    const data = JSON.parse(buffer.toString('utf-8'))

    // write file to disk
    writeFileSync('/tmp/inner.json', JSON.stringify(JSON.parse(data.json), null, 2))


    // const parser: Parser<CustomFeed, CustomItem> = new Parser({
    //     customFields: {
    //     //   feed: ['foo', 'baz'],
    //       item: ['bar']
    //     }
    //   });
    // const feed = await parser.parseURL('https://paragraph.xyz/api/blogs/rss/@cryptosapiens');
    // console.log(feed.title); // feed will have a `foo` property, type as a string

    // feed.items.forEach(item => {
    //   console.log(item.title + ':' + item.link) // item will have a `bar` property type as a number
    // });
}

main().catch(err => console.error(err));