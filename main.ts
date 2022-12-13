import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");;

const router = new Router();
router.post('/', async (context) => {
  // slackからのデータを取得
  const body = await context.request.body();

  // body.valueもawaitするみたい
  const payload = await body.value;

  // スラッシュコマンドの入力内容を取得
  // payloadはURLSearchParamsオブジェクトだった。
  const text = payload.get('text');

  console.log(text, 'text');

  // GPT-3を使って回答を生成
  const answer = await getAnswer(text);
  context.response.body = answer;
});

async function getAnswer(question) {
  const url = 'https://api.openai.com/v1/completions';

  const data = {
    model: 'text-davinci-003',
    prompt: question,
    temperature: 0.7,
    max_tokens: 256, //これは？
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result.choices[0].text;
}

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
