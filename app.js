const readline = require('readline/promises');
const PGClient = require('pg').Client;
const Model = require('./BaseModel');
const Controller = require('./BaseModel');
const { stdin: input, stdout: output } = process;

const rl = readline.createInterface({ input, output });

const client = new PGClient({
  user: 'postgres',
  host: 'localhost',
  password: '7387'
});

const COMMANDS = {
  1: 'insert',
  2: 'find',
  3: 'update',
  4: 'delete',
  5: 'generate random data'
};

const commandsList = Object.entries(COMMANDS).map(([key, value]) => `${key} - ${value}`).join('\n');

// create models
const models = {
  Baker: new Model('Baker', ['id', 'bakeryid', 'name', 'salary']),
  Bakery: new Model('Bakery', ['id', 'name', 'address', 'ownerid']),
  Owner: new Model('Owner', ['id', 'name']),
  Product: new Model('Product', ['id', 'bakerid', 'recipeid']),
  Recipe: new Model('Recipe', ['id', 'bakeryid', 'name', 'time'])
};

// create controllers for each model
const controllers = Object.keys(models)
    .map(modelName => new Controller(modelName));

const pickModel = async () => {
  console.log(`Models:\n${Object.keys(models).map((m, i) => `${i + 1} - ${m}`).join('\n')}`);
  const i = +(await rl.question(`Pick a model: `));
  return Object.values(models)[i - 1];
};

(async () => {
  await client.connect();

  const performQuery = async (query) => {
    try {
      return client.query(query);
    } catch (e) {
      console.log(e.message);
    }
  };

  const insertFlow = async () => {
    const model = await pickModel();
    console.log(model.keys);

    const entries = [];
    for (const key of model.keys) {
      const value = await rl.question(`${key}: `);
      entries.push([key, value]);
    }

    const obj = Object.fromEntries(entries);
    return performQuery(model.insert(obj))
        .then(() => console.log('1 row inserted!'));
  };

  const formatEnteredValue = (val) => {
    if (Number.isFinite(Number.parseInt(val))) return val;
    return val;
  };

  const updateFlow = async () => {
    const model = await pickModel();
    const id = +(await rl.question(`Enter id: `));
    console.log(`Keys:\n${model.keys.map((key, i) => `${i} - ${key}`).join('\n')}`);
    const i = +(await rl.question(`Pick a column: `));
    const col = model.keys[i];
    if (!col) return console.info('Error: Wrong column!');
    const value = formatEnteredValue(await rl.question('Value: '));
    return performQuery(model.update(id, col, value))
        .then(() => console.log('1 row updated!'));
  };

  const deleteFlow = async () => {
    const model = await pickModel();
    const id = +(await rl.question(`Enter id: `));
    return performQuery(model.delete(id))
        .then(() => console.log('1 row deleted!'));
  };

  const findFlow = async () => {
    const searches = [
      'Search the bakers who has salary greater than X',
      'Search the recipe which have the name like X',
      'Search the owner who have more than X Bakeries'
    ]
        .map((f, i) => `${i + 1} - ${f}`)
        .join('\n');

    console.log(`Pick the search to perform:\n${searches}`);

    const searchID = await rl.question('value:');

    if (searchID === '1') {
      const X = await rl.question('X = ');
      const query = `
          SELECT *
          FROM public."Baker"
          WHERE salary > ${X}
      `;
      const result = await performQuery(query);
      console.table(result.rows);
    }

    if (searchID === '2') {
      const X = await rl.question('X = ');
      const query = `
          SELECT *
          FROM public."Recipe"
          WHERE name ILIKE '%${X}%'
      `;
      const result = await performQuery(query);
      console.table(result.rows);
    }

    if (searchID === '3') {
      const X = await rl.question('X = ');
      const query = `
          SELECT id, name
          FROM public."Owner" o
                   JOIN (
              SELECT ownerid, count(*)
              FROM public."Bakery"
              GROUP BY ownerid
          ) g on o.id = g.ownerid
          WHERE g.count > ${X}
      `;
      const result = await performQuery(query);
      console.table(result.rows);
    }
  };

  const getRandomflow = async () => {
    if (count.equals("")) count = "20";
    if (!count.matches("\\d+")) {
      return "Incorret data ";
    }
    let sql = "";

    switch ({sql}) {
      case 1:
        sql = "INSERT INTO public.baker (['id', 'bakeryid', 'name', 'salary']) VALUES ((select max(id) from baker) + 1, (select bakeryid from baker order by random() limit 1), substr(md5(random()::text), 0, 25), FLOOR(RANDOM() * 100))";
        break;
      case 2:
        sql = "INSERT INTO public.owner (['id', 'name']) VALUES ((select max(id) from owner) + 1, substr(md5(random()::text), 0, 25)";
        break;
      case 3:
        sql = "INSERT INTO public.bakery (['id', 'name', 'address', 'ownerid']) VALUES ((select max(id) from bakery) + 1, substr(md5(random()::text), 0, 25), substr(md5(random()::text), 0, 25), (select ownerid from film bakery by random() limit 1)";
        break;
      case 4:
        sql = "INSERT INTO public.product ['id', 'bakerid', 'recipeid']) VALUES ((select max(id) from product) + 1,(select bakerid from product order by random() limit 1),(select recipeid from product order by random() limit 1) + 1";
        break;
      case 5:
        sql = "INSERT INTO public.recipe (['id', 'bakeryid', 'name', 'time']) VALUES ((select max(id) from recipe) + 1, (select bakeryid from recipe order by random() limit 1), substr(md5(random()::text), 0, 25), to_timestamp(random()*2147483647)::time)";
        break;
      default:
        break;
    }

    const result = await performQuery(sql);
    console.table(result.rows);
    return "Objects created!";
  }


  while (true) {
    console.log(`COMMANDS LIST:\n${commandsList}`);
    const command = +(await rl.question(`Choose a command: `));

    if (command === 1) await insertFlow();
    if (command === 2) await findFlow();
    if (command === 3) await updateFlow();
    if (command === 4) await deleteFlow();
    if (command === 5) await getRandomflow();
  }

})()

