const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const AdmZip = require("adm-zip");

const __approot = path.join(__dirname, '..');

class MergeCSV {
  constructor(month) {
    this.month = month;
    this.year = 2022;
    this.unzip = true;
    this.monthFolder = `crypto-save-history/${this.year}/${this.month}/`;

    this.exec(`sudo rm -rf ./csv/${this.month}`);
    this.exec(`mkdir ./csv/${this.month}`);

    // rm zip files
    // this.exec(`find ${path.join(__approot, this.monthFolder)} -type f -name '*.zip' -delete`);
  }

  exec(cmd) {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }


  async merge() {

    const coins = await this.getDirFiles(this.monthFolder);

    for (const coin of coins) {
      const zips = await this.getDirFiles(this.monthFolder + coin, '.zip');

      if (this.unzip) {
        for (const filename of zips) {
          if (filename.search('.zip') !== -1) {
            await this.unzipFile(
              path.join(__approot, this.monthFolder, coin, filename),
              path.join(__approot, this.monthFolder, coin)
            );
          }
        }
      }

      const csvs = await this.getDirFiles(this.monthFolder + coin, '.csv');
      const cmd = this.getCatFilesCmd(csvs, coin);

      console.log('----');
      console.log(cmd);
      console.log('----');

      this.exec(cmd);
    }

  }

  getCatFilesCmd(files, coin) {
    let cmd = 'cat ';

    const postfix = this.getDayFromCSVFile(files[0]) + '_' + this.getDayFromCSVFile(files[files.length - 1]);
    const month = this.month < 10 ? '0' + this.month : this.month;
    const outFilename = `${coin}-line-${this.year}-${month}-${postfix}.csv`;

    for (const filename of files) {
      if (filename.search('.csv') !== -1) {
        cmd += ' ' + path.join(__approot, this.monthFolder, coin, filename);
      }
    }
    cmd += ' > ' + path.join(__approot, `csv/${this.month}`, outFilename);
    return cmd;
  }

  async getDirFiles(folder, filter) {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(__approot, folder), (err, files) => {
        let res = files.filter(el => el.search('usdt') !== -1)
        if (filter && res[0].search(filter) !== -1) {
          res = this.rearrangeCSVFiles(res);
        }
        resolve(res);
      });
    });
  }

  async unzipFile(file, destination) {
    if (file.search('.zip') === -1) {
      return;
    }

    const zip = new AdmZip(file);

    return new Promise((resolve, reject) => {
      zip.extractAllToAsync(destination, true, true, error => {
        if (error) {
          console.log(error);
        }

        resolve();
      });
    })
  }

  rearrangeCSVFiles(filenames) {
    let output = [];
    filenames = filenames.filter(item => item.search('.csv') !== -1);

    filenames.forEach(filename => {
      const key = this.getDayFromCSVFile(filename);

      if (key) {
        output[key] = filename;
      }
    });

    output = output.filter(item => item);

    return output;
  }

  getDayFromCSVFile(filename) {
    const match = filename.match(/[\d]{1,2}\./);

    if (!match) return false

    return match[0].replace('.', '');
  }
}

module.exports = MergeCSV