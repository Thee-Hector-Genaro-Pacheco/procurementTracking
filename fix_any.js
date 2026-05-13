const fs = require('fs');
let code = fs.readFileSync('server/src/index.ts', 'utf-8');

code = code.replace(/users\.map\(u =>/g, 'users.map((u: any) =>');
code = code.replace(/requests\.map\(req =>/g, 'requests.map((req: any) =>');
code = code.replace(/req\.items\.map\(item =>/g, 'req.items.map((item: any) =>');
code = code.replace(/vendors\.map\(v =>/g, 'vendors.map((v: any) =>');
code = code.replace(/pos\.map\(po =>/g, 'pos.map((po: any) =>');
code = code.replace(/recs\.map\(r =>/g, 'recs.map((r: any) =>');
code = code.replace(/updatedRequest\.items\.map\(item =>/g, 'updatedRequest.items.map((item: any) =>');
code = code.replace(/po\.items\.find\(i =>/g, 'po.items.find((i: any) =>');
code = code.replace(/item\.receipts\.reduce\(\(sum, r\)/g, 'item.receipts.reduce((sum: number, r: any)');
code = code.replace(/i\.receipts\.reduce\(\(sum, r\)/g, 'i.receipts.reduce((sum: number, r: any)');

fs.writeFileSync('server/src/index.ts', code);
console.log("Done");
