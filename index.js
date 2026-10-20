import { Command } from 'commander';
import fs from 'node:fs';

const program = new Command();

function loadData(filePath) {
    let text;
    try {
        text = fs.readFileSync(filePath, 'utf-8');
    } catch {
        fail(`не вдалося прочитати файл "${filePath}"`);
    }
    try {
        return JSON.parse(text);
    } catch {
        fail(`файл "${filePath}" містить некоректний JSON`);
    }
}

function fail(message) {
    console.error(`Помилка: ${message}`);
    process.exit(1);
}

function findRoute(data, numberArg) {
    const num = Number(numberArg);
    if (Number.isNaN(num)) {
        fail(`"${numberArg}" не є числом`);
    }
    const route = data.routes.find((r) => r.route_number === num);
    if (!route) {
        fail(`маршрут №${num} не знайдено`);
    }
    return route;
}

program
.name('transport')
.description('Маршрути громадського транспорту Львова')
.version('1.0.0')
.option('-f, --file <path>', 'шлях до JSON-файлу', 'data.json');


program.parse();