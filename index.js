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

program
.command('list')
.description('показати список маршрутів')
.option('-l, --limit <n>', 'максимальна кількість маршрутів')
.action((options) => {
    let routes = loadData(program.opts().file).routes;
    if (options.limit !== undefined) {
        const limit = Number(options.limit);
        if (!Number.isInteger(limit) || limit < 1) {
            fail('ліміт має бути цілим числом більше нуля');
        }
        routes = routes.slice(0, limit);
    }
    for (const r of routes) {
        console.log(`№${r.route_number} | ${r.type_of_transport} | ${r.route_name}`);
    }
});

program
.command('show')
.description('показати маршрут повністю')
.argument('<number>', 'номер маршруту')
.action((number) => {
    const route = findRoute(loadData(program.opts().file), number);
    console.log(JSON.stringify(route, null, 2));
});

program
.command('field')
.description('показати значення поля маршруту (шлях через крапку)')
.argument('<number>', 'номер маршруту')
.argument('<path>', 'шлях до поля, наприклад interval.weekdays або stops.0.name')
.action((number, path) => {
    const route = findRoute(loadData(program.opts().file), number);
    let current = route;
    for (const key of path.split('.')) {
        if (current === null || typeof current !== 'object' || !Object.hasOwn(current, key)) {
            fail(`поле "${path}" відсутнє в маршруті №${route.route_number}`);
        }
        current = current[key];
    }
    console.log(current === null ? 'null (значення порожнє)' : JSON.stringify(current));
});


program.parse();