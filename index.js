const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');

fs.readdir(__dirname, (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
});

// ^[\w]*usdt-line-[\d]{4}-[\d]{2}-[\d]{1,2}.csv$
// var matches = text.match(/price\[(\d+)\]\[(\d+)\]/);


// exec("ls -la", (error, stdout, stderr) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }
//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
// });