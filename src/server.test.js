const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

describe('Server', () => {
  let server = null;

  beforeAll.nock(async () => {
    server = await initServer({
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/article'),
        path.resolve(__dirname, '../test/data/cms'),
      ],
    });
  });

  afterAll(() => {
    server.close();
  });

  it.nock('populates the schema with remote data', async () => {
    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query fetchArticle($input: ArticleInput) { 
          article(input: $input) { 
            state
            creationDate
            headlinePlain
          }
        }`,
        variables: {
          input: {
            id: '5afb22871a6fcc00015ec57d',
          },
        },
      })
      .expect(200);

    const expected = {
      data: {
        article: expect.objectContaining({
          headlinePlain: 'Polizeihund für immer dienstunfähig?',
          state: expect.any(String),
          creationDate: expect.any(String),
        }),
      },
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });
});