import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fss from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  private filePath = path.join(__dirname, '../data.txt');
  private outputPath = path.join(__dirname, '../output/processed.json');

  getRandomAlphabeticalString(length = 10): string {
    return Array.from({ length }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 26)),
    ).join('');
  }

  getRandomInteger(): number {
    return Math.floor(Math.random() * 10000);
  }

  getRandomFloat(): number {
    return parseFloat((Math.random() * 10000).toFixed(2));
  }

  getRandomAlphanumeric(): string {
    return Math.random().toString(36).substring(2, 12);
  }

  async generateFile(): Promise<string> {
    console.log(`Generating file at: ${this.filePath}`);

    return new Promise((resolve, reject) => {
      const stream = fss.createWriteStream(this.filePath);
      let size = 0;
      const MAX_SIZE = 10 * 1024 * 1024;

      const writeChunk = () => {
        while (size < MAX_SIZE) {
          const data =
            [
              this.getRandomAlphabeticalString(),
              this.getRandomInteger(),
              this.getRandomFloat(),
              this.getRandomAlphanumeric(),
            ].join(',') + ',';

          const dataSize = Buffer.byteLength(data);

          if (size + dataSize > MAX_SIZE) {
            const remainingBytes = MAX_SIZE - size;
            const truncatedData = data.slice(0, remainingBytes);
            stream.write(truncatedData);
            size += Buffer.byteLength(truncatedData);
            break;
          }

          if (!stream.write(data)) {
            stream.once('drain', writeChunk);
            return;
          }

          size += dataSize;
        }
        stream.end();
      };

      stream.on('finish', () => {
        console.log(`File generation complete. Final size: ${size} bytes`);
        resolve(this.filePath);
      });

      stream.on('error', (err) => {
        console.log('Error writing file:', err);
        reject(
          new HttpException(
            'Error generating file',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });

      writeChunk();
    });
  }

  async processFile(): Promise<{ message: string; outputPath: string }> {
    console.log(`Processing file: ${this.filePath}`);

    try {
      if (!fss.existsSync(this.filePath)) {
        throw new HttpException('File does not exist', HttpStatus.NOT_FOUND);
      }

      const content = await fs.readFile(this.filePath, 'utf8');
      if (!content.trim()) {
        throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
      }

      const items = content
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '');

      const categorizedItems: { value: string; type: string }[] = [];

      items.forEach((item) => {
        let type = 'Unknown';

        if (/^\d+$/.test(item)) {
          type = 'Integer';
        } else if (/^\d+\.\d+$/.test(item)) {
          type = 'Float';
        } else if (/^[a-zA-Z]+$/.test(item)) {
          type = 'Alphabetical String';
        } else {
          type = 'Alphanumeric';
        }

        categorizedItems.push({ value: item, type });
      });

      categorizedItems.sort((a, b) => {
        const order = {
          Integer: 1,
          Float: 2,
          Alphanumeric: 3,
          'Alphabetical String': 4,
        };
        return (
          order[a.type] - order[b.type] ||
          a.value.localeCompare(b.value, 'en', { numeric: true })
        );
      });

      const sortedResults: Record<string, string> = {};
      categorizedItems.forEach((item) => {
        sortedResults[item.value] = item.type;
      });

      console.log(
        'Sorted Processed Data:',
        JSON.stringify(sortedResults, null, 2),
      );

      const outputDir = path.dirname(this.outputPath);
      if (!fss.existsSync(outputDir)) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      await fs.writeFile(
        this.outputPath,
        JSON.stringify(sortedResults, null, 2),
        'utf8',
      );

      console.log(`Processing complete. Output saved to: ${this.outputPath}`);
      return { message: 'Processing complete', outputPath: this.outputPath };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log('Error processing file:', error.message);
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        console.log('Unknown error occurred');
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
