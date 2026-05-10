const fs = require('fs');

let content = fs.readFileSync('src/index.ts', 'utf8');

// Fix createProcurementRequest
content = content.replace(/status: 'SUBMITTED',\n            requestedById: input\.requestedById \|\| null,\n          }\n        }\);/g, `status: 'SUBMITTED',\n            requestedById: input.requestedById || null,\n          },\n          include: { items: true, requestedBy: true, approvedBy: true }\n        });`);

// Fix updateProcurementRequestStatus
content = content.replace(/data: { status }\n        }\);/g, `data: { status },\n          include: { items: true, requestedBy: true, approvedBy: true }\n        });`);

// Fix procurementRequest (findUnique)
content = content.replace(/include: { items: true }\n      }\);\n      if \(!req\) return null;/g, `include: { items: true, requestedBy: true, approvedBy: true }\n      });\n      if (!req) return null;`);

fs.writeFileSync('src/index.ts', content);
